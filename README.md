# Oh My Claude Code

Claude Code가 원칙을 따르고, 증거 기반으로 작업하고, 실패시 멈추도록 만드는 설정입니다.

## What It Does

**7 Core Principles** - Claude Code가 항상 따르는 원칙
1. 수정 전 코드 읽기
2. 증거 없이 완료 없음
3. 3회 실패시 STOP → REVERT → ASK
4. 작은 변경, 자주 검증
5. 완료 후 전체 정리
6. 불확실하면 연구
7. 기존 패턴 존중

**4 Specialized Agents** - 위임용 에이전트
- `research` - 외부 문서/베스트 프랙티스 조사
- `architect` - 시스템 설계
- `verify` - 검증 및 증거 수집
- `refine` - 구현 후 정리

## Installation

### For Humans

Claude Code에 이 메시지 복사:

```
Install oh-my-claude-code by following:
https://raw.githubusercontent.com/kekmodel/oh-my-claude-code/master/README.md
```

### For LLM Agents

```bash
git clone https://github.com/kekmodel/oh-my-claude-code.git /tmp/omcc
mkdir -p ~/.claude/agents ~/.claude/rules
cp /tmp/omcc/agents/*.md ~/.claude/agents/
cp /tmp/omcc/rules/*.md ~/.claude/rules/
rm -rf /tmp/omcc
```

## License

MIT
