# Oh My Claude Code

> Claude Code를 원칙 기반으로 작동하게 만드는 설정

**"Done" means proven, not claimed.**

---

## Why

Claude Code는 강력하지만, 가끔:
- 코드를 읽지 않고 수정함
- "완료"라고 하지만 테스트 안 돌림
- 실패해도 계속 같은 시도를 반복
- 기존 패턴 무시하고 새 패턴 도입

**Oh My Claude Code**는 이 문제를 해결합니다.

---

## 7 Principles

| # | Principle | Effect |
|---|-----------|--------|
| 1 | **Understand before modifying** | 수정 전 반드시 코드 읽기 |
| 2 | **No completion without evidence** | 테스트/빌드 통과 증거 필수 |
| 3 | **3 failures → STOP** | 3회 실패시 멈추고 질문 |
| 4 | **Small changes, frequent verify** | 작게 변경, 자주 검증 |
| 5 | **See the whole after completion** | 완료 후 전체 정리 |
| 6 | **Research when uncertain** | 모르면 추측 말고 조사 |
| 7 | **Respect existing patterns** | 기존 코드 스타일 따르기 |

---

## 5 Agents

| Agent | Role |
|-------|------|
| `analyze` | 코드베이스 분석, LSP/AST-Grep 활용 |
| `research` | 외부 문서/베스트 프랙티스 조사 |
| `architect` | 시스템 설계, ADR 작성 |
| `verify` | 빌드/테스트 실행, 증거 수집 |
| `refine` | 구현 후 정리, 데드코드 제거 |

---

## Install

**For Humans** - Claude Code에 복사:

```
Install oh-my-claude-code:
https://raw.githubusercontent.com/kekmodel/oh-my-claude-code/master/README.md
```

**For Agents** - 아래 순서대로 실행:

### 1. Core Setup

```bash
git clone https://github.com/kekmodel/oh-my-claude-code.git /tmp/omcc
mkdir -p ~/.claude/agents ~/.claude/rules
cp /tmp/omcc/agents/*.md ~/.claude/agents/
cp /tmp/omcc/rules/*.md ~/.claude/rules/
rm -rf /tmp/omcc
```

### 2. LSP Setup (Optional but Recommended)

LSP 활성화 - 쉘 프로필에 추가:

```bash
echo 'export ENABLE_LSP_TOOL=1' >> ~/.bashrc  # or ~/.zshrc
```

LSP 플러그인 설치:

```bash
claude plugin install pyright@claude-code-lsps       # Python
claude plugin install vtsls@claude-code-lsps         # TypeScript/JavaScript
claude plugin install gopls@claude-code-lsps         # Go
claude plugin install rust-analyzer@claude-code-lsps # Rust
```

Language Server 설치 (프로젝트 언어에 맞게):

```bash
# Python
npm install -g pyright

# TypeScript
npm install -g typescript-language-server typescript

# Go
go install golang.org/x/tools/gopls@latest

# Rust
rustup component add rust-analyzer
```

### 3. Restart Claude Code

설정 적용을 위해 Claude Code 재시작.

---

## License

MIT
