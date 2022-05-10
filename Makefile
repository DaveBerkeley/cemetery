
.PHONY: docs

docs: fpc.json
	./gen_docs.py

fpc.json: fpc.csv
	./csv2json.py  fpc.csv > fpc.json

upload: docs
	rsync -rptvu index.html fpc.json whereami.js photos docs zeus:/www/whatdowewant/fpc

serve: docs
	python3 -m http.server 8080

