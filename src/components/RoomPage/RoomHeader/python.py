Here is a short Python program on Polymorphism:

✅ Python Program — Polymorphism

# Polymorphism example

class Dog:
    def sound(self):
        print("Dog barks")

class Cat:
    def sound(self):
        print("Cat meows")

# Same method name, different behavior
for animal in (Dog(), Cat()):
    animal.sound()

✅ Output

Dog barks
Cat meows

Explanation:
Polymorphism means one method name (sound) behaves differently for different objects.