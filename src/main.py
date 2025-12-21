from src.communication.agent_coordinator import AgentCoordinator

def main():
    coordinator = AgentCoordinator()
    coordinator.run_cycle()

if __name__ == "__main__":
    main()
