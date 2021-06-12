
.PHONY: docs

docs:
	./gen_docs.py

fpc.json: fpc.csv docs
	./csv2json.py  fpc.csv > fpc.json

upload: fpc.json
	rsync -rptvu index.html fpc.json whereami.js photos docs xanthos:/www/whatdowewant/fpc

serve: fpc.json
	python3 -m http.server 8080

