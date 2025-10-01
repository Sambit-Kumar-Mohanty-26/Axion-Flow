from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI(
    title="Axion Flow AI Service",
    description="Provides intelligent recommendations and predictions for the digital twin.",
    version="1.0.0"
)


class Skill(BaseModel):
    id: str
    name: str

class WorkerSkill(BaseModel):
    skill: Skill
    proficiency: int # 1=Beginner, 2=Intermediate, 3=Expert

class Worker(BaseModel):
    id: str
    name: str
    status: str # AVAILABLE, BUSY, OFFLINE
    fatigueLevel: float = Field(..., ge=0.0, le=1.0) # ge=greater than or equal to, le=less than or equal to
    skills: List[WorkerSkill]

class Task(BaseModel):
    id: str
    description: str
    priority: str # LOW, MEDIUM, HIGH, CRITICAL
    requiredSkillId: Optional[str] = None

class RecommendationRequest(BaseModel):
    task: Task
    available_workers: List[Worker]

@app.get("/api/health")
def health_check():
    return {"status": "UP", "service": "AI Service"}

@app.post("/api/recommend_worker")
def recommend_worker(request: RecommendationRequest):
    """
    Receives a task and a list of available workers, then recommends the best worker.
    """
    best_worker = None
    highest_score = -1

    SKILL_PROFICIENCY_WEIGHT = 0.6
    FATIGUE_WEIGHT = 0.4

    for worker in request.available_workers:
        score = 0

        skill_score = 0
        if request.task.requiredSkillId:
            for worker_skill in worker.skills:
                if worker_skill.skill.id == request.task.requiredSkillId:
                    skill_score = (worker_skill.proficiency / 3.0) * SKILL_PROFICIENCY_WEIGHT
                    break 
        else:
            
            skill_score = 1.0 * SKILL_PROFICIENCY_WEIGHT

        fatigue_score = (1 - worker.fatigueLevel) * FATIGUE_WEIGHT

        score = skill_score + fatigue_score

        if score > highest_score:
            highest_score = score
            best_worker = worker

    if best_worker is None:
        return {"recommended_worker_id": None, "message": "No suitable worker found."}
        
    return {"recommended_worker_id": best_worker.id, "score": highest_score, "worker_name": best_worker.name}