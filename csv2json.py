#!/usr/bin/python3

import csv
import json

import sys

for name in sys.argv[1:]:
    f = open(name)
    lines = []
    reader = csv.reader(f, delimiter=',', quotechar='"')
    headings = None
    for line in reader:
        d = {}
        if not headings:
            headings = line
            continue

        for i, col in enumerate(line):
            d[headings[i]] = col
        lines.append(d)

j = json.dumps(lines)

print(j)
        

#   FIN
