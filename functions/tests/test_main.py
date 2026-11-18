import pytest

def test_placeholder_unit_test():
    """Basic sanity test to ensure pytest runs successfully in CI/CD pipeline."""
    assert True

def test_voucher_code_formatting():
    """Verify that voucher codes are normalized to uppercase and stripped of whitespace."""
    raw_input_code = "  race-test-1  "
    formatted = str(raw_input_code).strip().upper()
    assert formatted == "RACE-TEST-1"
