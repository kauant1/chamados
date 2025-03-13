while True:
    valor = int(input("insira o valor: "))
    if valor >= 31:
        print ("s1\n")
    elif valor >= 21 and valor <= 30:
        print ("s2\n")
    elif valor >= 11 and valor <= 20:
        print ("s3\n")
    elif valor >= 1 and valor <= 10:
        print ("s4\n")
    else:
        print ("valor errdo")