#!/bin/bash
# everything-claude-code 同步工具
# 工作流: upstream → D:\ai\mcc → Marketplaces → Cache

PLUGIN_CACHE="$HOME/.claude/plugins/cache/everything-claude-code/everything-claude-code/1.2.0"
PLUGIN_MARKET="$HOME/.claude/plugins/marketplaces/everything-claude-code"

show_help() {
    echo "everything-claude-code 同步工具"
    echo ""
    echo "工作流: upstream → D:\\ai\\mcc → Marketplaces → Cache"
    echo ""
    echo "用法: ./sync-tools.sh [command]"
    echo ""
    echo "查看上游:"
    echo "  status        查看上游有哪些新提交"
    echo "  diff          查看与上游的文件差异"
    echo "  diff-file <f> 查看指定文件与上游的差异"
    echo "  fetch         获取上游最新代码"
    echo ""
    echo "选择性更新 (从上游拉取到本地):"
    echo "  update-file <path>  更新指定文件从上游"
    echo "  update-dir  <path>  更新指定目录从上游"
    echo "  cherry-pick <hash>  挑选特定提交"
    echo ""
    echo "部署 (同步到 Claude):"
    echo "  deploy        同步到 Marketplaces 和 Cache 目录"
    echo ""
    echo "示例:"
    echo "  ./sync-tools.sh status"
    echo "  ./sync-tools.sh diff-file agents/planner.md"
    echo "  ./sync-tools.sh update-file skills/new-skill/SKILL.md"
    echo "  ./sync-tools.sh deploy"
}

fetch_upstream() {
    echo ">>> 获取上游更新..."
    git fetch upstream
    echo ">>> 完成"
}

show_status() {
    echo ">>> 上游新提交 (可选择性拉取):"
    echo ""
    local commits=$(git log HEAD..upstream/main --oneline --date=short --format="%h %ad %s" 2>/dev/null)
    if [ -z "$commits" ]; then
        echo "  (无新提交)"
    else
        echo "$commits"
    fi
    echo ""
    echo ">>> 本地自定义提交 (不在上游):"
    local local_commits=$(git log upstream/main..HEAD --oneline --date=short --format="%h %ad %s" 2>/dev/null)
    if [ -z "$local_commits" ]; then
        echo "  (无)"
    else
        echo "$local_commits"
    fi
}

show_diff() {
    echo ">>> 与上游的文件差异:"
    echo ""
    echo "上游有但本地没有的文件:"
    git diff --name-only HEAD upstream/main --diff-filter=A 2>/dev/null | sed 's/^/  + /'
    echo ""
    echo "本地修改的文件:"
    git diff --name-only HEAD upstream/main --diff-filter=M 2>/dev/null | sed 's/^/  M /'
    echo ""
    echo "本地删除的文件 (上游有):"
    git diff --name-only HEAD upstream/main --diff-filter=D 2>/dev/null | sed 's/^/  - /'
}

show_file_diff() {
    local file="$1"
    if [ -z "$file" ]; then
        echo "错误: 请指定文件路径"
        exit 1
    fi
    echo ">>> $file 与上游的差异:"
    echo ""
    git diff HEAD upstream/main -- "$file"
}

update_file() {
    local file="$1"
    if [ -z "$file" ]; then
        echo "错误: 请指定文件路径"
        exit 1
    fi
    echo ">>> 从上游更新: $file"
    git checkout upstream/main -- "$file"
    git add "$file"
    git commit -m "Update $file from upstream"
    echo ">>> 完成. 运行 './sync-tools.sh deploy' 同步到 Claude"
}

update_dir() {
    local dir="$1"
    if [ -z "$dir" ]; then
        echo "错误: 请指定目录路径"
        exit 1
    fi
    echo ">>> 从上游更新目录: $dir"
    git checkout upstream/main -- "$dir"
    git add "$dir"
    git commit -m "Update $dir from upstream"
    echo ">>> 完成. 运行 './sync-tools.sh deploy' 同步到 Claude"
}

cherry_pick_commit() {
    local hash="$1"
    if [ -z "$hash" ]; then
        echo "错误: 请指定提交哈希"
        exit 1
    fi
    echo ">>> Cherry-pick 提交: $hash"
    git cherry-pick "$hash"
    echo ">>> 完成. 运行 './sync-tools.sh deploy' 同步到 Claude"
}

deploy_to_plugin() {
    echo ">>> 同步 D:\\ai\\mcc → Marketplaces → Cache"
    echo ""

    # 同步到 Marketplaces
    echo ">>> 1/2 同步到 Marketplaces..."
    rm -rf "$PLUGIN_MARKET"/*
    cp -r ./* "$PLUGIN_MARKET/" 2>/dev/null
    cp -r ./.claude-plugin "$PLUGIN_MARKET/" 2>/dev/null
    rm -f "$PLUGIN_MARKET/sync-tools.sh" "$PLUGIN_MARKET/SYNC-README.md"

    # 同步到 Cache
    echo ">>> 2/2 同步到 Cache..."
    rm -rf "$PLUGIN_CACHE"/*
    cp -r ./* "$PLUGIN_CACHE/" 2>/dev/null
    cp -r ./.claude-plugin "$PLUGIN_CACHE/" 2>/dev/null
    rm -f "$PLUGIN_CACHE/sync-tools.sh" "$PLUGIN_CACHE/SYNC-README.md"

    echo ""
    echo ">>> 完成! 重启 Claude Code 以加载更新。"
}

# 主逻辑
cd "$(dirname "$0")"

case "$1" in
    status)
        fetch_upstream
        show_status
        ;;
    diff)
        fetch_upstream
        show_diff
        ;;
    diff-file)
        fetch_upstream
        show_file_diff "$2"
        ;;
    fetch)
        fetch_upstream
        ;;
    update-file)
        fetch_upstream
        update_file "$2"
        ;;
    update-dir)
        fetch_upstream
        update_dir "$2"
        ;;
    cherry-pick)
        cherry_pick_commit "$2"
        ;;
    deploy)
        deploy_to_plugin
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo "未知命令: $1"
        show_help
        exit 1
        ;;
esac
