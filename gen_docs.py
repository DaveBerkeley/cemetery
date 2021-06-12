#!/usr/bin/python3

#   Reads documents in source/*
#   and converts them into html using pandoc

import os
import json
import subprocess

data = json.loads(open('fpc.json').read())

for entry in data:
    if not entry['text']:
        continue
    assert entry['html'], "requires html field"
    src = 'source/' + entry['text']
    dst = 'docs/' + entry['html']
    name = entry['name']

    # check files exists / times to see if needs to be remade
    make = False
    if not os.path.exists(dst):
        make = True
    else:
        # check file times
        t_src = os.path.getmtime(src)
        t_dst = os.path.getmtime(dst)
        if t_src > t_dst:
            make = True

    if not make:
        continue

    cmd = F'pandoc -t html --standalone --metadata pagetitle="{name}" {src} -o {dst}'
    print(cmd)
    subprocess.call(cmd, shell=True)

# FIN
