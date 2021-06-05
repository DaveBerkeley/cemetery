
fpc.json: fpc.csv
	./csv2json.py  fpc.csv > fpc.json

upload: fpc.json
	rsync index.html fpc.json xanthos:/www/whatdowewant/fpc

