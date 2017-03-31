init:
	npm install
	cd frontend && npm install
compile:
	cd process_watcher/native && make compile
run:
	node start-panel.js


