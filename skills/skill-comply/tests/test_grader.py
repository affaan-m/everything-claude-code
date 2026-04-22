"""Tests for grader module — compliance scoring with LLM classification."""

from pathlib import Path
from unittest.mock import patch

import pytest

from scripts.grader import ComplianceResult, StepResult, grade
from scripts.parser import parse_spec, parse_trace

FIXTURES = Path(__file__).parent.parent / "fixtures"


@pytest.fixture
def tdd_spec():
    return parse_spec(FIXTURES / "tdd_spec.yaml")


@pytest.fixture
def compliant_trace():
    return parse_trace(FIXTURES / "compliant_trace.jsonl")


@pytest.fixture
def noncompliant_trace():
    return parse_trace(FIXTURES / "noncompliant_trace.jsonl")


def _mock_compliant_classification(spec, trace, model="haiku"):  # noqa: ARG001
    """Simulate LLM correctly classifying a compliant trace."""
    return {
        "write_test": [0],
        "run_test_red": [1],
        "write_impl": [2],
        "run_test_green": [3],
        "refactor": [4],
    }


def _mock_noncompliant_classification(spec, trace, model="haiku"):
    """Simulate LLM classifying a noncompliant trace (impl before test)."""
    return {
        "write_impl": [0],    # src/fib.py written first
        "write_test": [1],    # test written second
        "run_test_green": [2],  # only a passing test run
    }


def _mock_empty_classification(spec, trace, model="haiku"):
    return {}


class TestGradeCompliant:
    @patch("scripts.grader.classify_events", side_effect=_mock_compliant_classification)
    def test_returns_compliance_result(self, mock_cls, tdd_spec, compliant_trace) -> None:
        result = grade(tdd_spec, compliant_trace)
        assert isinstance(result, ComplianceResult)

    @patch("scripts.grader.classify_events", side_effect=_mock_compliant_classification)
    def test_full_compliance(self, mock_cls, tdd_spec, compliant_trace) -> None:
        result = grade(tdd_spec, compliant_trace)
        assert result.compliance_rate == 1.0

    @patch("scripts.grader.classify_events", side_effect=_mock_compliant_classification)
    def test_all_required_steps_detected(self, mock_cls, tdd_spec, compliant_trace) -> None:
        result = grade(tdd_spec, compliant_trace)
        required_results = [s for s in result.steps if s.step_id in
                           ("write_test", "run_test_red", "write_impl", "run_test_green")]
        assert all(s.detected for s in required_results)

    @patch("scripts.grader.classify_events", side_effect=_mock_compliant_classification)
    def test_optional_step_detected(self, mock_cls, tdd_spec, compliant_trace) -> None:
        result = grade(tdd_spec, compliant_trace)
        refactor = next(s for s in result.steps if s.step_id == "refactor")
        assert refactor.detected is True

    @patch("scripts.grader.classify_events", side_effect=_mock_compliant_classification)
    def test_no_hook_promotion_recommended(self, mock_cls, tdd_spec, compliant_trace) -> None:
        result = grade(tdd_spec, compliant_trace)
        assert result.recommend_hook_promotion is False

    @patch("scripts.grader.classify_events", side_effect=_mock_compliant_classification)
    def test_step_evidence_not_empty(self, mock_cls, tdd_spec, compliant_trace) -> None:
        result = grade(tdd_spec, compliant_trace)
        for step in result.steps:
            if step.detected:
                assert len(step.evidence) > 0


class TestGradeNoncompliant:
    @patch("scripts.grader.classify_events", side_effect=_mock_noncompliant_classification)
    def test_low_compliance(self, mock_cls, tdd_spec, noncompliant_trace) -> None:
        result = grade(tdd_spec, noncompliant_trace)
        assert result.compliance_rate < 1.0

    @patch("scripts.grader.classify_events", side_effect=_mock_noncompliant_classification)
    def test_write_test_fails_ordering(self, mock_cls, tdd_spec, noncompliant_trace) -> None:
        """write_test has before_step=write_impl, but test is written AFTER impl."""
        result = grade(tdd_spec, noncompliant_trace)
        write_test = next(s for s in result.steps if s.step_id == "write_test")
        assert write_test.detected is False

    @patch("scripts.grader.classify_events", side_effect=_mock_noncompliant_classification)
    def test_run_test_red_not_detected(self, mock_cls, tdd_spec, noncompliant_trace) -> None:
        result = grade(tdd_spec, noncompliant_trace)
        run_red = next(s for s in result.steps if s.step_id == "run_test_red")
        assert run_red.detected is False

    @patch("scripts.grader.classify_events", side_effect=_mock_noncompliant_classification)
    def test_hook_promotion_recommended(self, mock_cls, tdd_spec, noncompliant_trace) -> None:
        result = grade(tdd_spec, noncompliant_trace)
        assert result.recommend_hook_promotion is True

    @patch("scripts.grader.classify_events", side_effect=_mock_noncompliant_classification)
    def test_failure_reasons_present(self, mock_cls, tdd_spec, noncompliant_trace) -> None:
        result = grade(tdd_spec, noncompliant_trace)
        failed_steps = [s for s in result.steps if not s.detected and s.step_id != "refactor"]
        for step in failed_steps:
            assert step.failure_reason is not None


class TestGradeEdgeCases:
    @patch("scripts.grader.classify_events", side_effect=_mock_empty_classification)
    def test_empty_trace(self, mock_cls, tdd_spec) -> None:
        result = grade(tdd_spec, [])
        assert result.compliance_rate == 0.0
        assert result.recommend_hook_promotion is True

    @patch("scripts.grader.classify_events", side_effect=_mock_compliant_classification)
    def test_compliance_rate_is_ratio_of_required_only(self, mock_cls, tdd_spec, compliant_trace) -> None:
        result = grade(tdd_spec, compliant_trace)
        assert result.compliance_rate == 1.0

    @patch("scripts.grader.classify_events", side_effect=_mock_compliant_classification)
    def test_spec_id_in_result(self, mock_cls, tdd_spec, compliant_trace) -> None:
        result = grade(tdd_spec, compliant_trace)
        assert result.spec_id == "tdd-workflow"


class TestAfterStepForwardReference:
    """Regression tests for after_step referencing a step defined later in the spec.

    Before the fix, _check_temporal_order only consulted `resolved` for the
    after_step target.  Because `resolved` is built incrementally (earliest
    steps first), a forward-referenced step is never in `resolved` when its
    referencing step is checked — so the constraint silently passed as if the
    dependency had been met.  After the fix, the code falls back to
    `classified`, which holds ALL LLM-classified events up front.
    """

    @staticmethod
    def _make_forward_ref_classification(spec, trace, model="haiku"):  # noqa: ARG004
        """Mock LLM classification for forward-reference scenario.

        Spec order:  step_a  →  step_b (after_step: step_c)  →  step_c
        Trace order: step_a @ T1, step_b @ T3, step_c @ T2

        step_b must occur AFTER step_c.
        In the trace step_c is at T2 and step_b is at T3, so the constraint
        IS satisfied — but only if the grader reads step_c's events from
        `classified` (it won't be in `resolved` yet when step_b is checked).
        """
        return {
            "step_a": [0],   # timestamp T1
            "step_b": [2],   # timestamp T3 — must be after step_c
            "step_c": [1],   # timestamp T2
        }

    @staticmethod
    def _make_forward_ref_violating_classification(spec, trace, model="haiku"):  # noqa: ARG004
        """Classification where step_b actually occurs BEFORE step_c (violation)."""
        return {
            "step_a": [0],   # timestamp T1
            "step_b": [1],   # timestamp T2 — occurs BEFORE step_c
            "step_c": [2],   # timestamp T3
        }

    @pytest.fixture()
    def forward_ref_spec(self):
        """Build a spec in-memory: step_b references step_c which comes after it."""
        from scripts.parser import ComplianceSpec, Detector, Step

        return ComplianceSpec(
            id="forward-ref-test",
            name="Forward Reference Test",
            source_rule="rules/test.md",
            version="1.0",
            steps=(
                Step(
                    id="step_a",
                    description="First step, no ordering constraint",
                    required=True,
                    detector=Detector(description="Any first event"),
                ),
                Step(
                    id="step_b",
                    description="Second step in spec order but must occur after step_c",
                    required=True,
                    detector=Detector(
                        description="Must follow step_c",
                        after_step="step_c",  # forward reference: step_c is defined next
                    ),
                ),
                Step(
                    id="step_c",
                    description="Third step in spec order, referenced forward by step_b",
                    required=True,
                    detector=Detector(description="The forward-referenced step"),
                ),
            ),
            threshold_promote_to_hook=0.6,
        )

    @pytest.fixture()
    def forward_ref_trace(self):
        """Three events with timestamps that satisfy step_b after step_c."""
        from scripts.parser import ObservationEvent

        return [
            ObservationEvent(
                timestamp="2024-01-01T00:00:01Z",
                event="tool_use",
                tool="Write",
                session="s1",
                input="step_a content",
                output="ok",
            ),
            ObservationEvent(
                timestamp="2024-01-01T00:00:02Z",
                event="tool_use",
                tool="Bash",
                session="s1",
                input="step_c content",
                output="ok",
            ),
            ObservationEvent(
                timestamp="2024-01-01T00:00:03Z",
                event="tool_use",
                tool="Write",
                session="s1",
                input="step_b content",
                output="ok",
            ),
        ]

    @patch(
        "scripts.grader.classify_events",
        side_effect=_make_forward_ref_classification.__func__,
    )
    def test_after_step_forward_reference_falls_back_to_classified(
        self, mock_cls, forward_ref_spec, forward_ref_trace
    ) -> None:
        """Regression: after_step=step_c where step_c is defined after step_b in the spec.

        When step_b is being graded, step_c has not yet been added to `resolved`
        (it is processed later in the spec loop).  The fix ensures the grader
        falls back to `classified` so that step_b's constraint is correctly
        evaluated and — because step_b's timestamp > step_c's timestamp — step_b
        is detected as compliant.
        """
        result = grade(forward_ref_spec, forward_ref_trace)

        step_b_result = next(s for s in result.steps if s.step_id == "step_b")
        assert step_b_result.detected is True, (
            "step_b must be detected when after_step constraint is satisfied via classified fallback; "
            f"got failure_reason={step_b_result.failure_reason!r}"
        )
        assert step_b_result.failure_reason is None

    @patch(
        "scripts.grader.classify_events",
        side_effect=_make_forward_ref_violating_classification.__func__,
    )
    def test_after_step_forward_reference_violation_still_fails(
        self, mock_cls, forward_ref_spec, forward_ref_trace
    ) -> None:
        """Regression guard: when step_b actually precedes step_c the constraint must FAIL.

        Ensures the fallback to classified does not accidentally swallow real
        ordering violations.
        """
        result = grade(forward_ref_spec, forward_ref_trace)

        step_b_result = next(s for s in result.steps if s.step_id == "step_b")
        assert step_b_result.detected is False, (
            "step_b must NOT be detected when it occurs before the after_step target"
        )
        assert step_b_result.failure_reason is not None
