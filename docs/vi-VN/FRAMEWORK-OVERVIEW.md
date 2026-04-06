# EraGenAI / ECC — Tổng quan bộ khung & cách dùng với Claude/GPT

Tài liệu này liệt kê nhanh các chức năng cốt lõi đang có trong repo, đồng thời hướng dẫn cách sử dụng kết hợp với Claude hoặc GPT.

## 1) Quy mô bộ khung hiện có

- **47 agents chuyên biệt**
- **181 skills**
- **79 commands**
- **Workflow hooks tự động** cho nhiều sự kiện trong vòng đời làm việc

> Nguồn thống kê hiện tại được đồng bộ từ cấu hình/tài liệu chính trong repo.

## 2) Thành phần chức năng chính

### Agents
- Dùng để chia nhỏ công việc theo vai trò: planner, code-reviewer, security-reviewer, build-error-resolver, e2e-runner...
- Phù hợp khi cần tách bài toán lớn thành nhiều bước chuyên môn.

### Skills
- Là bề mặt workflow chính, có thể gọi trực tiếp hoặc được hệ thống gợi ý tự động.
- Bao phủ nhiều nhóm tác vụ: TDD, review, bảo mật, nghiên cứu tài liệu, backend/frontend patterns...

### Commands
- Cung cấp điểm vào nhanh theo tác vụ thường gặp (`/tdd`, `/code-review`, `/security-scan`, `/harness-audit`, ...).
- Hữu ích để chuẩn hóa thao tác trong team.

### Hooks tự động
- Chạy trước/sau các sự kiện tool để cưỡng chế chất lượng (lint/check/policy), cảnh báo lỗi sớm và tự động hóa lặp lại.
- Giảm sai sót thủ công khi làm việc nhiều phiên.

## 3) Cách dùng kết hợp Claude hoặc GPT

## A. Dùng với Claude Code (native)

1. Cài plugin/repo theo hướng dẫn chính ở `README.md`.
2. Chạy workflow chuẩn:
   - `/ecc:plan "Mô tả tính năng"` → lập kế hoạch.
   - `/tdd` → viết test trước.
   - `/code-review` → rà soát chất lượng.
   - `/security-scan` → quét rủi ro bảo mật.
3. Bật hooks/rules phù hợp để tự động kiểm tra theo mỗi lần chỉnh sửa.

**Khi nên chọn Claude lane**
- Bạn muốn tận dụng trực tiếp hệ sinh thái command/agent/hook của ECC.
- Cần pipeline làm việc đồng nhất giữa nhiều thành viên.

## B. Dùng với GPT (thông qua Codex/OpenCode)

1. Đồng bộ assets sang bề mặt harness GPT (điển hình Codex/OpenCode):
   - AGENTS.md
   - Skills cần thiết
   - MCP servers cần thiết
2. Áp dụng cùng triết lý workflow:
   - Plan → TDD → Review → Security gate.
3. Giữ số MCP/tool vừa đủ để tiết kiệm context window và chi phí.

**Khi nên chọn GPT lane**
- Bạn đã có quy trình làm việc chính trên Codex/OpenCode.
- Cần tái sử dụng skills/patterns nhưng muốn chạy trên model/harness khác.

## 4) Gợi ý phối hợp thực tế (Claude + GPT)

- **Claude** cho điều phối chính (lập kế hoạch, policy, hooks).
- **GPT** cho nhánh tác vụ song song (generate test cases, docs draft, refactor gợi ý).
- Cuối cùng hợp nhất theo quality gate của repo: test + review + security scan.

## 5) Checklist triển khai nhanh

- [ ] Chọn lane chính: Claude hoặc GPT (Codex/OpenCode)
- [ ] Cài tối thiểu agents/skills cần thiết cho dự án
- [ ] Bật rules + hooks mức chuẩn
- [ ] Thiết lập security scan định kỳ
- [ ] Chuẩn hóa quy trình Plan → TDD → Review → Security trước khi merge
