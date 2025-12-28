from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import math

app = FastAPI(
    title="Axion Flow AI Service",
    description="Provides intelligent recommendations based on MCDM (Multi-Criteria Decision Making)."
)


class Skill(BaseModel):
    id: str
    name: str

class WorkerSkill(BaseModel):
    skill: Skill
    proficiency: int

class Worker(BaseModel):
    id: str
    name: str
    status: str
    fatigueLevel: float
    location_x: float
    location_y: float
    skills: List[WorkerSkill]

class Task(BaseModel):
    id: str
    description: str
    priority: str
    requiredSkillId: Optional[str] = None
    location_x: float = 50.0 
    location_y: float = 50.0

class RecommendationRequest(BaseModel):
    task: Task
    available_workers: List[Worker]

def calculate_distance(w_x, w_y, t_x, t_y):
    return math.sqrt((w_x - t_x)**2 + (w_y - t_y)**2)

@app.get("/api/health")
def health_check():
    return {"status": "UP", "service": "AI Brain"}

@app.post("/api/recommend_worker")
def recommend_worker(request: RecommendationRequest):
    """
    Receives a task and a list of available workers, then recommends the best worker
    based on Skill Match, Fatigue, and Proximity to the task.
    """
    best_worker = None
    highest_score = -1

    WEIGHT_SKILL = 0.5
    WEIGHT_FATIGUE = 0.3
    WEIGHT_DISTANCE = 0.2

    TASK_X = request.task.location_x
    TASK_Y = request.task.location_y

    print(f"🧠 AI: Analyzing {len(request.available_workers)} workers for task '{request.task.description}' at [{TASK_X}, {TASK_Y}]...")

    for worker in request.available_workers:
        skill_score = 0
        has_required_skill = False
        
        if request.task.requiredSkillId:
            for ws in worker.skills:
                if ws.skill.id == request.task.requiredSkillId:
                    skill_score = ws.proficiency / 5.0 
                    has_required_skill = True
                    break
            
            if not has_required_skill:
                continue
        else:
            skill_score = 1.0 

        fatigue_score = 1.0 - worker.fatigueLevel

        dist = calculate_distance(worker.location_x, worker.location_y, TASK_X, TASK_Y)
        distance_score = max(0, 1.0 - (dist / 141.0))

        total_score = (
            (skill_score * WEIGHT_SKILL) +
            (fatigue_score * WEIGHT_FATIGUE) +
            (distance_score * WEIGHT_DISTANCE)
        )

        print(f"   -> Worker {worker.name}: Skill={skill_score:.2f}, Fatigue={fatigue_score:.2f}, Dist={distance_score:.2f} ({dist:.1f} units away) | FINAL={total_score:.3f}")

        if total_score > highest_score:
            highest_score = total_score
            best_worker = worker

    if best_worker:
        return {
            "recommended_worker_id": best_worker.id,
            "worker_name": best_worker.name,
            "score": highest_score
        }
    else:
        return {"recommended_worker_id": None, "message": "No suitable worker found."}