init:
	npm install
	cd frontend && npm install
compile:
	cd process_watcher/native && make compile

enclose:
	mkdir -p dist/bin
	enclose -v 6.3.1 -c .enclose.config.js -o obsidian start-panel.js
	mv obsidian dist/bin
	cp ./node_modules/sqlite3/lib/binding/node-v48-linux-x64/node_sqlite3.node dist/bin

build_frontend:
	cd frontend && npm run build
clean:
	rm -rf dist
run:
	node start-panel.js


