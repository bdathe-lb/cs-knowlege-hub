# knowledge-hub-web
#
# package.json 里那几个脚本的方便入口，外加两件 npm 脚本没做的事：
# 清理生成物，以及 preview 之前自动 build —— 全文搜索索引只在 build 时
# 由 Pagefind 生成，直接 astro preview 会看到一个没有正文匹配的搜索页。
#
# 目标说明写在各自那行的 ## 后面，help 从这里现取，不另列一份清单。
#
# 源仓库位置默认 ../knowledge-hub，这个默认值在 scripts/sync.mjs 里，
# 不在这儿重复一遍。要换位置：
#   make build KB_SOURCE=/path/to/knowledge-hub
# 命令行上设的变量 make 会自动传进子进程环境，不需要额外 export。

.DEFAULT_GOAL := help

# 同步产物：全在 .gitignore 里，删掉跑一次 sync 就回来
GENERATED := src/content/docs src/data public/assets
BUILT     := dist .astro

.PHONY: help install sync dev build preview clean distclean

help: ## 列出可用目标
	@awk -F':.*## ' '/^[a-z-]+:.*## /{printf "  make %-9s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# lock 文件比 node_modules 新就重装。npm install 可能回写 lock，
# 所以装完 touch 一下，否则下次还会认为是脏的。
node_modules: package-lock.json
	npm install
	@touch $@

install: node_modules ## 安装依赖

sync: node_modules ## 只跑同步，看统计与警告
	npm run sync

dev: node_modules ## 开发服务器 http://localhost:4321
	npm run dev

build: node_modules ## 构建到 dist/
	npm run build

preview: build ## 构建后起预览服务器，全文搜索只有这里能用
	npm run preview

clean: ## 删掉同步产物与构建产物
	rm -rf $(GENERATED) $(BUILT)

distclean: clean ## 连 node_modules 一起删
	rm -rf node_modules
