from core.generator import LocalGenerator, CloudGenerator

def select_generator(choice):
    if choice == 1:
        return LocalGenerator()
    elif choice == 2:
        return CloudGenerator()
    else:
        raise ValueError("Invalid generator selection")

def select():
    print("Choose a generator:")
    print("1. Local model")
    print("2. Cloud model")

    try:
        choice = int(input("Enter choice (1/2): "))
        prompt = input("Enter your prompt: ")
        gen = select_generator(choice)
      
    except ValueError:
        print("Please enter a valid number (1 or 2).")
        return

    result = gen.generate(prompt=prompt)
    print("Generation complete.")
    print("Generated Output:")
    print(result)

