
fpc.json: fpc.csv
	./csv2json.py  fpc.csv > fpc.json

upload: fpc.json
	rsync index.html fpc.json whereami.js xanthos:/www/whatdowewant/fpc

serve:
	python3 -m http.server 8080

