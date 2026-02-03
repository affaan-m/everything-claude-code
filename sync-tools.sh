#!/bin/bash
# everything-claude-code 同步工具
# 用法: ./sync-tools.sh [command]

PLUGIN_CACHE="$HOME/.claude/plugins/cache/everything-claude-code/everything-claude-code/1.2.0"
PLUGIN_MARKET="$HOME/.claude/plugins/marketplaces/everything-claude-code"

show_help() {
    echo "everything-claude-code 同步工具"
    echo ""
    echo "用法: ./sync-tools.sh [command]"
    echo ""
    echo "命令:"
    echo "  status      查看上游有哪些新提交"
    echo "  diff        查看与上游的文件差异"
    echo "  fetch       获取上游最新代码"
    echo "  update      选择性更新 (交互式)"
    echo "  update-file <path>  更新指定文件从上游"
    echo "  update-dir  <path>  更新指定目录从上游"
    echo "  deploy      同步到 Claude Code 插件目录"
    echo "  help        显示帮助"
    echo ""
    echo "示例:"
    echo "  ./sync-tools.sh status"
    echo "  ./sync-tools.sh update-file agents/planner.md"
    echo "  ./sync-tools.sh update-dir skills/security-review/"
    echo "  ./sync-tools.sh deploy"
}

fetch_upstream() {
    echo ">>> 获取上游更新..."
    git fetch upstream
    echo ">>> 完成"
}

show_status() {
    echo ">>> 上游新提交:"
    echo ""
    git log HEAD..upstream/main --oneline --date=short --format="%h %ad %s"
    echo ""
    echo ">>> 本地领先提交:"
    git log upstream/main..HEAD --oneline --date=short --format="%h %ad %s"
}

show_diff() {
    echo ">>> 与上游的文件差异:"
    echo ""
    git diff --stat upstream/main
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
    echo ">>> 完成"
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
    echo ">>> 完成"
}

interactive_update() {
    echo ">>> 交互式更新"
    echo ""
    echo "上游改动的文件:"
    git diff --name-only upstream/main
    echo ""
    echo "输入要更新的文件路径 (每行一个, 空行结束):"

    files=()
    while IFS= read -r line; do
        [ -z "$line" ] && break
        files+=("$line")
    done

    if [ ${#files[@]} -eq 0 ]; then
        echo "未选择任何文件"
        exit 0
    fi

    for file in "${files[@]}"; do
        echo "更新: $file"
        git checkout upstream/main -- "$file"
    done

    git add -A
    git commit -m "Selective update from upstream: ${files[*]}"
    echo ">>> 完成"
}

deploy_to_plugin() {
    echo ">>> 同步到 Claude Code 插件目录..."

    # 同步到 cache 目录
    if [ -d "$PLUGIN_CACHE" ]; then
        echo ">>> 同步到 cache: $PLUGIN_CACHE"
        rsync -av --exclude='.git' --exclude='sync-tools.sh' --exclude='SYNC-README.md' ./ "$PLUGIN_CACHE/"
    fi

    # 同步到 marketplaces 目录
    if [ -d "$PLUGIN_MARKET" ]; then
        echo ">>> 同步到 marketplaces: $PLUGIN_MARKET"
        rsync -av --exclude='.git' --exclude='sync-tools.sh' --exclude='SYNC-README.md' ./ "$PLUGIN_MARKET/"
    fi

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
    fetch)
        fetch_upstream
        ;;
    update)
        fetch_upstream
        interactive_update
        ;;
    update-file)
        fetch_upstream
        update_file "$2"
        ;;
    update-dir)
        fetch_upstream
        update_dir "$2"
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
