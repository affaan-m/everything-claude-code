#!/usr/bin/env python3
"""
USPTO Patent Examination Data System (PEDS) Helper

Provides functions for retrieving patent examination data using the
uspto-opendata-python library.

Requires:
    - uspto-opendata-python: pip install uspto-opendata-python

Note: This script provides a simplified interface to PEDS data.
For full functionality, use the uspto-opendata-python library directly.
"""

import sys
import json
from typing import Dict, List, Optional, Any
from datetime import datetime

try:
    from uspto.peds import PEDSClient as OriginalPEDSClient
    HAS_USPTO_LIB = True
except ImportError:
    HAS_USPTO_LIB = False
    print("Warning: uspto-opendata-python not installed.", file=sys.stderr)
    print("Install with: pip install uspto-opendata-python", file=sys.stderr)


class PEDSHelper:
    """Helper class for accessing PEDS data."""

    def __init__(self):
        """Initialize PEDS client."""
        if not HAS_USPTO_LIB:
            raise ImportError("uspto-opendata-python library required")
        self.client = OriginalPEDSClient()

    def get_application(self, application_number: str) -> Optional[Dict]:
        """
        Get patent application data by application number.

        Args:
            application_number: Application number (e.g., "16123456")

        Returns:
            Application data dictionary with:
                - title: Application title
                - filing_date: Filing date
                - status: Current status
                - transactions: List of prosecution events
                - inventors: List of inventors
                - assignees: List of assignees
        """
        try:
            result = self.client.get_application(application_number)
            return self._format_application_data(result)
        except Exception as e:
            print(f"Error retrieving application {application_number}: {e}", file=sys.stderr)
            return None

    def get_patent(self, patent_number: str) -> Optional[Dict]:
        """
        Get patent data by patent number.

        Args:
            patent_number: Patent number (e.g., "11234567")

        Returns:
            Patent data dictionary
        """
        try:
            result = self.client.get_patent(patent_number)
            return self._format_application_data(result)
        except Exception as e:
            print(f"Error retrieving patent {patent_number}: {e}", file=sys.stderr)
            return None

    def get_transaction_history(self, application_number: str) -> List[Dict]:
        """
        Get transaction history for an application.

        Args:
            application_number: Application number

        Returns:
            List of transactions with date, code, and description
        """
        app_data = self.get_application(application_number)
        if app_data and 'transactions' in app_data:
            return app_data['transactions']
        return []

    def get_office_actions(self, application_number: str) -> List[Dict]:
        """
        Get office actions for an application.

        Args:
            application_number: Application number

        Returns:
            List of office actions with dates and types
        """
        transactions = self.get_transaction_history(application_number)

        # Filter for office action transaction codes
        oa_codes = ['CTNF', 'CTFR', 'AOPF', 'NOA']

        office_actions = [
            trans for trans in transactions
            if trans.get('code') in oa_codes
        ]

        return office_actions

    def get_status_summary(self, application_number: str) -> Dict[str, Any]:
        """
        Get a summary of application status.

        Args:
            application_number: Application number

        Returns:
            Dictionary with status summary:
                - current_status: Current application status
                - filing_date: Filing date
                - status_date: Status date
                - is_patented: Boolean indicating if patented
                - patent_number: Patent number if granted
                - pendency_days: Days since filing
        """
        app_data = self.get_application(application_number)
        if not app_data:
            return {}

        filing_date = app_data.get('filing_date')
        if filing_date:
            filing_dt = datetime.strptime(filing_date, '%Y-%m-%d')
            pendency_days = (datetime.now() - filing_dt).days
        else:
            pendency_days = None

        return {
            'current_status': app_data.get('app_status'),
            'filing_date': filing_date,
            'status_date': app_data.get('app_status_date'),
            'is_patented': app_data.get('patent_number') is not None,
            'patent_number': app_data.get('patent_number'),
            'issue_date': app_data.get('patent_issue_date'),
            'pendency_days': pendency_days,
            'title': app_data.get('title'),
            'inventors': app_data.get('inventors', []),
            'assignees': app_data.get('assignees', [])
        }

    def analyze_prosecution(self, application_number: str) -> Dict[str, Any]:
        """
        Analyze prosecution history.

        Args:
            application_number: Application number

        Returns:
            Dictionary with prosecution analysis:
                - total_office_actions: Count of office actions
                - rejections: Count of rejections
                - allowance: Boolean if allowed
                - response_count: Count of applicant responses
                - examination_duration: Days from filing to allowance/abandonment
        """
        transactions = self.get_transaction_history(application_number)
        app_summary = self.get_status_summary(application_number)

        if not transactions:
            return {}

        analysis = {
            'total_office_actions': 0,
            'non_final_rejections': 0,
            'final_rejections': 0,
            'allowance': False,
            'responses': 0,
            'abandonment': False
        }

        for trans in transactions:
            code = trans.get('code', '')
            if code == 'CTNF':
                analysis['non_final_rejections'] += 1
                analysis['total_office_actions'] += 1
            elif code == 'CTFR':
                analysis['final_rejections'] += 1
                analysis['total_office_actions'] += 1
            elif code in ['AOPF', 'OA']:
                analysis['total_office_actions'] += 1
            elif code == 'NOA':
                analysis['allowance'] = True
            elif code == 'WRIT':
                analysis['responses'] += 1
            elif code == 'ABND':
                analysis['abandonment'] = True

        analysis['status'] = app_summary.get('current_status')
        analysis['pendency_days'] = app_summary.get('pendency_days')

        return analysis

    def _format_application_data(self, raw_data: Dict) -> Dict:
        """Format raw PEDS data into cleaner structure."""
        # This is a placeholder - actual implementation depends on
        # the structure returned by uspto-opendata-python
        return raw_data


def main():
    """Command-line interface for PEDS data."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Query USPTO Patent Examination Data System (PEDS)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Get application data by application number
  %(prog)s --application 16123456

  # Get patent data by patent number
  %(prog)s --patent 11234567

  # Get status summary
  %(prog)s --status 16123456

  # Analyze prosecution history
  %(prog)s --analyze 16123456

  # Get transaction history
  %(prog)s --transactions 16123456

  # Get office actions
  %(prog)s --office-actions 16123456
        """
    )

    if not HAS_USPTO_LIB:
        parser.error("uspto-opendata-python library not installed. Install with: pip install uspto-opendata-python")

    # Main operation arguments (mutually exclusive)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--application', '-a', help='Get application by application number')
    group.add_argument('--patent', '-p', help='Get patent by patent number')
    group.add_argument('--status', '-s', help='Get status summary for application')
    group.add_argument('--analyze', help='Analyze prosecution history for application')
    group.add_argument('--transactions', '-t', help='Get transaction history for application')
    group.add_argument('--office-actions', '-o', help='Get office actions for application')

    args = parser.parse_args()

    try:
        helper = PEDSHelper()

        if args.application:
            result = helper.get_application(args.application)
        elif args.patent:
            result = helper.get_patent(args.patent)
        elif args.status:
            result = helper.get_status_summary(args.status)
        elif args.analyze:
            result = helper.analyze_prosecution(args.analyze)
        elif args.transactions:
            result = helper.get_transaction_history(args.transactions)
        elif args.office_actions:
            result = helper.get_office_actions(args.office_actions)

        if result:
            print(json.dumps(result, indent=2))
        else:
            print("No data found", file=sys.stderr)
            sys.exit(1)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
