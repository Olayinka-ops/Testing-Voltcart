# Voltcart — QA Practice Project

Voltcart is a small gadget e-commerce web app, built and tested end-to-end as a QA portfolio project. It demonstrates the full testing lifecycle: requirements analysis, test design, test execution, and defect reporting, applied using SDLC and STLC principles.

## What this project demonstrates

- Writing a PRD-style requirements document and using it as the single source of truth for testing
- Designing test scenarios and test cases ranked by business importance (Critical → Low)
- Executing 117 test cases across 18 scenarios covering functional and non-functional requirements
- Identifying, documenting, and tracking 20 confirmed defects with full reproduction steps
- Root-cause grouping of related defects rather than reporting symptoms in isolation


## Project structure

| File | Description |
| `index.html`, `style.css`, `app.js` | The Voltcart app under test |
| `Voltcart PRD.md` | Product Requirements Document — defines how every feature should behave (FR-01 to FR-14, plus non-functional requirements) |
| `Voltcart_QA_Test_Documentation.xlsx` | Full test documentation: Test Scenarios, Test Cases (117), Bug Report log, and a live execution summary |
| `Voltcart_Full_Test_Cycle_Report.docx` | Final consolidated bug report — 20 confirmed defects with steps to reproduce, expected vs. actual results, severity, and priority |

## Test execution summary

- Total test cases executed: 117
- Passed: 97 (83%)
- Failed: 20 (17%)
- Areas with no failures: delivery fee and totals, sorting, category filters, session persistence, keyboard navigation, responsive layout

## Key defects found

- Checkout phone number field accepts values longer than 11 digits, letters, and symbols with no validation (FR-12)
- Cart quantity field accepts 0, negative numbers, and quantities above available stock (FR-05)
- Coupon discounts stack instead of replacing each other when re-applied or combined (FR-06)
- Registration accepts invalid email formats, including `a@b` (FR-09)
- Login fails for a correctly registered account with valid credentials — a critical defect blocking all logged-in functionality (FR-10)
- Product search does not match partial names and is case-sensitive (FR-02)

Full details, reproduction steps, and severity/priority ratings for every defect are in `Voltcart_Full_Test_Cycle_Report.docx`.

## Tools and skills used

- Manual functional and boundary testing
- PRD-based test case design
- Risk-based test prioritization
- Google Sheets for test case management
- Microsoft Word/Google Docs for formal bug reporting