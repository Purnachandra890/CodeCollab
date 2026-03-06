from itertools import permutations

letters = "SENDMORY"

for p in permutations(range(10), len(letters)):
    S,E,N,D,M,O,R,Y = p
    
    if S == 0 or M == 0:
        continue

    SEND  = 1000*S + 100*E + 10*N + D
    MORE  = 1000*M + 100*O + 10*R + E
    MONEY = 10000*M + 1000*O + 100*N + 10*E + Y

    if SEND + MORE == MONEY:
        print(SEND, "+", MORE, "=", MONEY)
        break