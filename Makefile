init:
	npm install
	cd frontend && npm install
compile:
	cd process_watcher/native && make compile
build_frontend:
	cd frontend && npm run build
run:
	node start-panel.js


