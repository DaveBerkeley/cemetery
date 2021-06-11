#!/usr/bin/env python3

# in scratch/whereami run eg
# ./gps_idx.py geo:50.35805,-4.17378?z=18 --pix >/tmp/a.txt

print(','.join(("date","name","title","photo","lon","lat","text")))

for line in open('/tmp/a.txt'):
    parts = line.strip().split()
    ymd, ts, lat, lon, path = parts
    y, m, d = ymd.split('-')
    path = path[len('http://localhost:8081/pix/'):]
    line = ','.join(('/'.join((d, m, y)), 'person', 'note', path, lon, lat, ''))
    print(line)

#   FIN
