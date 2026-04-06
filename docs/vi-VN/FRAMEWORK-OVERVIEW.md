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

## 6) Hướng dẫn code (chuẩn thực thi đề xuất)

Mục tiêu của bộ khung là giúp bạn code có cấu trúc, giảm lỗi, và giữ chất lượng ổn định khi làm việc với AI agent.

### Chu trình code chuẩn

1. **Plan trước khi code**
   - Dùng planner để chia task thành milestone nhỏ.
   - Xác định rõ input/output, rủi ro, tiêu chí hoàn tất.

2. **TDD trước**
   - Viết test fail (RED) cho hành vi cần có.
   - Chỉ code mức tối thiểu để pass test (GREEN).
   - Refactor giữ test xanh (IMPROVE).

3. **Review bắt buộc**
   - Chạy code-reviewer sau mỗi cụm thay đổi có ý nghĩa.
   - Nếu chạm dữ liệu nhạy cảm hoặc API công khai, chạy thêm security-reviewer.

4. **Quality gate trước commit**
   - Chạy lint + test + (nếu có) e2e cho flow quan trọng.
   - Chỉ commit khi không có lỗi mức CRITICAL/HIGH.

### Mẫu prompt ngắn để code theo khung

```text
Hãy triển khai tính năng X theo quy trình:
1) planner: tách milestone
2) tdd-guide: viết test trước
3) code-reviewer: review sau khi pass test
4) security-reviewer: kiểm tra input validation và secrets
Yêu cầu output: kế hoạch + patch + test plan.
```

## 7) Hướng dẫn sử dụng bộ khung 47/181/79 trong thực tế

### A. Khi làm tính năng mới

- Bước 1: `planner` tạo plan implementation.
- Bước 2: `tdd-guide` hướng dẫn viết test trước.
- Bước 3: agent theo ngôn ngữ (`typescript-reviewer`, `python-reviewer`, `go-reviewer`...) kiểm tra theo stack.
- Bước 4: `code-reviewer` rà soát tổng thể maintainability.
- Bước 5: `security-reviewer` kiểm tra bảo mật trước merge.

### B. Khi build fail hoặc bug production

- Dùng `build-error-resolver` để khoanh vùng lỗi compile/runtime.
- Nếu bug liên quan hiệu năng/context, dùng `harness-optimizer`.
- Nếu bug ở quy trình lặp/tự động nhiều phiên, dùng `loop-operator`.

### C. Khi cần scale công việc cho team

- Chuẩn hóa workflow theo skill-first:
  - Skill là bề mặt chính.
  - Command chỉ là entrypoint tương thích.
- Chọn nhóm skill cốt lõi theo dự án thay vì bật toàn bộ 181 skills ngay từ đầu.
- Duy trì hooks để tự động kiểm tra, tránh phụ thuộc hoàn toàn vào review thủ công.

### D. Bộ tối thiểu khuyến nghị (starter pack)

- **Agents:** planner, tdd-guide, code-reviewer, security-reviewer, build-error-resolver
- **Skills:** tdd-workflow, security-review, documentation-lookup, verification-loop
- **Commands:** `/tdd`, `/code-review`, `/security-scan`, `/build-fix`, `/harness-audit`
- **Hooks:** pre-edit lint/check + post-edit validation + session summary

### E. Mẹo vận hành hiệu quả

- Không bật quá nhiều MCP/tool cùng lúc để tránh tốn context.
- Dùng lại checklist quality gate cho mọi PR để giảm sai khác giữa thành viên.
- Ưu tiên commit nhỏ, rõ mục tiêu, dễ rollback.
