#!/usr/bin/env python3
"""
Reproducible CV Generator for Kevin Guevara Devia
Generates two ATS-friendly, typographically calibrated editions:
1. Kevin_Guevara_CV.pdf (and Kevin_Guevara_CV_1Page_ATS.pdf) — High-density 1-Page Senior SWE ATS Edition
2. Kevin_Guevara_CV_2Page_Extended.pdf — 2-Page Extended Staff/Senior Systems & Architecture Edition

Run with:
  uv run --with reportlab python3 generate_cv.py
"""

import shutil
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# Color Palette — High-contrast editorial slate & deep navy accent (100% print & ATS safe)
INK_PRIMARY = colors.HexColor("#0F172A")
INK_SECONDARY = colors.HexColor("#334155")
INK_MUTED = colors.HexColor("#64748B")
ACCENT_BLUE = colors.HexColor("#1D4ED8")
RULE_COLOR = colors.HexColor("#CBD5E1")
RULE_SUBTLE = colors.HexColor("#E2E8F0")


def make_styles(compact: bool = True):
    """Create calibrated paragraph styles for 1-page compact or 2-page extended layout."""
    body_size = 8.35 if compact else 8.75
    body_leading = 10.65 if compact else 11.6
    bullet_space = 1.2 if compact else 2.0
    section_before = 5.0 if compact else 7.5
    section_after = 2.0 if compact else 2.8

    return {
        "name": ParagraphStyle(
            "Name",
            fontName="Helvetica-Bold",
            fontSize=18 if compact else 19.5,
            leading=20.5 if compact else 22.5,
            textColor=INK_PRIMARY,
            spaceAfter=1,
        ),
        "title": ParagraphStyle(
            "Title",
            fontName="Helvetica-Bold",
            fontSize=9.6 if compact else 10.2,
            leading=12 if compact else 13,
            textColor=ACCENT_BLUE,
            spaceAfter=2,
        ),
        "contact": ParagraphStyle(
            "Contact",
            fontName="Helvetica",
            fontSize=8.0 if compact else 8.4,
            leading=10.2,
            textColor=INK_SECONDARY,
            spaceAfter=2 if compact else 4,
        ),
        "section": ParagraphStyle(
            "SectionHeader",
            fontName="Helvetica-Bold",
            fontSize=8.2 if compact else 8.8,
            leading=9.8 if compact else 10.8,
            textColor=INK_PRIMARY,
            spaceBefore=section_before,
            spaceAfter=section_after,
        ),
        "summary": ParagraphStyle(
            "Summary",
            fontName="Helvetica",
            fontSize=body_size,
            leading=body_leading,
            textColor=INK_SECONDARY,
            spaceAfter=1.5,
        ),
        "skill_cat": ParagraphStyle(
            "SkillCat",
            fontName="Helvetica-Bold",
            fontSize=8.0 if compact else 8.4,
            leading=10.0 if compact else 11.0,
            textColor=INK_PRIMARY,
        ),
        "skill_val": ParagraphStyle(
            "SkillVal",
            fontName="Helvetica",
            fontSize=8.0 if compact else 8.4,
            leading=10.0 if compact else 11.0,
            textColor=INK_SECONDARY,
        ),
        "role_left": ParagraphStyle(
            "RoleLeft",
            fontName="Helvetica-Bold",
            fontSize=8.7 if compact else 9.2,
            leading=10.8 if compact else 11.6,
            textColor=INK_PRIMARY,
        ),
        "role_right": ParagraphStyle(
            "RoleRight",
            fontName="Helvetica",
            fontSize=7.9 if compact else 8.4,
            leading=10.8 if compact else 11.6,
            textColor=INK_MUTED,
            alignment=2,  # Right
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            fontName="Helvetica",
            fontSize=body_size,
            leading=body_leading,
            textColor=INK_SECONDARY,
            leftIndent=9,
            firstLineIndent=-9,
            spaceAfter=bullet_space,
        ),
        "oss_title": ParagraphStyle(
            "OSSTitle",
            fontName="Helvetica-Bold",
            fontSize=8.25 if compact else 8.75,
            leading=10.2 if compact else 11.2,
            textColor=INK_PRIMARY,
            spaceAfter=0.5,
        ),
        "oss_desc": ParagraphStyle(
            "OSSDesc",
            fontName="Helvetica",
            fontSize=8.0 if compact else 8.45,
            leading=10.0 if compact else 10.9,
            textColor=INK_SECONDARY,
            spaceAfter=1.8 if compact else 3.0,
        ),
    }


def section_header(title: str, styles: dict):
    return [
        Paragraph(title.upper(), styles["section"]),
        HRFlowable(
            width="100%",
            thickness=0.65,
            color=RULE_COLOR,
            spaceBefore=0,
            spaceAfter=3.5,
        ),
    ]


def role_header(company: str, role: str, period: str, location: str, styles: dict, width: float):
    left_html = f"<b>{company}</b> &bull; <font color='#1D4ED8'>{role}</font>"
    right_html = f"{period} &nbsp;|&nbsp; {location}"
    tbl = Table(
        [[Paragraph(left_html, styles["role_left"]), Paragraph(right_html, styles["role_right"])]],
        colWidths=[width * 0.68, width * 0.32],
    )
    tbl.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "BASELINE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 1.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
            ]
        )
    )
    return tbl


def bullet(text: str, styles: dict):
    return Paragraph(f"&bull;&nbsp; {text}", styles["bullet"])


def build_1page_ats(output_path: Path):
    """Build the 1-Page High-Density ATS-Perfect Edition."""
    margin_x = 0.45 * inch
    margin_y = 0.36 * inch
    content_width = letter[0] - (2 * margin_x)
    styles = make_styles(compact=True)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=margin_x,
        rightMargin=margin_x,
        topMargin=margin_y,
        bottomMargin=margin_y,
        title="Kevin Guevara Devia — Senior Full Stack Software Engineer CV",
        author="Kevin Guevara Devia",
        subject="Senior Full Stack Software Engineer Resume (ATS-Optimized 1-Page)",
    )

    story = []

    # 1. HEADER
    story.append(Paragraph("Kevin Guevara Devia", styles["name"]))
    story.append(
        Paragraph(
            "Senior Full Stack Software Engineer &nbsp;&bull;&nbsp; Fintech / Stablecoins, Applied AI &amp; Distributed Systems",
            styles["title"],
        )
    )
    contact_html = (
        "Cali, Colombia (Remote UTC-5) &nbsp;&bull;&nbsp; "
        "<a href='mailto:kevinguevaradevia@gmail.com' color='#1D4ED8'>kevinguevaradevia@gmail.com</a> &nbsp;&bull;&nbsp; "
        "+57 302 406 7155 &nbsp;&bull;&nbsp; "
        "<a href='https://linkedin.com/in/kev-guevara' color='#1D4ED8'>linkedin.com/in/kev-guevara</a> &nbsp;&bull;&nbsp; "
        "<a href='https://github.com/kevdevg' color='#1D4ED8'>github.com/kevdevg</a> &nbsp;&bull;&nbsp; "
        "<a href='https://kevdevg.github.io/portfolio/' color='#1D4ED8'>kevdevg.github.io/portfolio</a>"
    )
    story.append(Paragraph(contact_html, styles["contact"]))

    # 2. PROFESSIONAL SUMMARY
    story.extend(section_header("Professional Summary", styles))
    story.append(
        Paragraph(
            "Senior Full Stack Software Engineer with <b>9+ years</b> architecting and shipping production systems across "
            "programmable fintech/stablecoin rails, applied AI/ML pipelines, Web3 protocols, and native desktop security tooling. "
            "Proven track record with <b>367+ merged pull requests</b> and <b>4,000+ code contributions</b> across 35+ public and private "
            "production repositories in fast-moving distributed teams. Expert in TypeScript/React, Python/NestJS, Go/Wails, and Solana/EVM infrastructure.",
            styles["summary"],
        )
    )

    # 3. TECHNICAL SKILLS
    story.extend(section_header("Technical Skills", styles))
    skills_data = [
        ("Languages:", "TypeScript, JavaScript (ES2024), Python, Go (Golang), SQL, Rust, Solidity, Objective-C (CGO)"),
        ("Frontend & UI:", "React 19, Next.js, Vite, Tailwind CSS, Zustand, Redux, GraphQL, React Three Fiber / WebGL"),
        ("Backend & Data:", "NestJS, FastAPI, Node.js, Prisma ORM, PostgreSQL, Redis, BullMQ, REST & Webhook Architectures"),
        ("Fintech & Web3:", "Solana, Ethereum / EVM, Brale (Stablecoin Issuance & Treasury), Coinflow, Metaplex, DFNS Wallets"),
        ("AI, ML & Native:", "LLM Agents (Claude, OpenAI, LiteLLM, LangGraph, n8n), Deepgram, MediaPipe, TFLite, Wails (Go), FFmpeg"),
        ("Cloud & DevOps:", "Docker, Linux Kernel Sandboxing (Landlock / seccomp), GCP, Modal Serverless, Coolify, GitHub Actions"),
    ]
    skill_rows = [
        [Paragraph(cat, styles["skill_cat"]), Paragraph(val, styles["skill_val"])]
        for cat, val in skills_data
    ]
    skill_tbl = Table(skill_rows, colWidths=[1.15 * inch, content_width - 1.15 * inch])
    skill_tbl.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0.8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0.8),
            ]
        )
    )
    story.append(skill_tbl)

    # 4. PROFESSIONAL EXPERIENCE
    story.extend(section_header("Professional Experience", styles))

    # Monadical
    story.append(
        role_header(
            "Monadical",
            "Senior Full Stack Software Engineer",
            "2020 - Present",
            "Remote",
            styles,
            content_width,
        )
    )
    monadical_bullets = [
        "<b>Agricultural Stablecoin Payments Platform (SpudPay) — Lead Developer:</b> Architected and shipped a B2B/B2C payment platform on Brale's Treasury infrastructure (React 19, NestJS, Prisma, PostgreSQL, Redis), delivering Coinflow card-to-USDC settlement, stablecoin issuance, submerchant KYB onboarding, and idempotent webhook settlement across <b>28+ merged PRs</b>.",
        "<b>TicketNetwork Programmable Stablecoin Controller:</b> Engineered automated treasury routing and programmable stablecoin payment settlement flows for a major ticket marketplace in TypeScript across <b>100+ production commits</b>.",
        "<b>Greywall &amp; Greyproxy Security Ecosystem:</b> Core contributor (<b>74+ commits</b>) to a cross-platform desktop companion app (Go + Wails + React/TypeScript), building native macOS system tray integration via CGO/Objective-C (NSStatusItem), embedded SOCKS5/DNS proxy installers, and app discovery flows.",
        "<b>Reflector On-Premise ML Transcription Platform:</b> Built end-to-end audio diarization pipelines, speaker merge tooling, and FFmpeg audio preprocessing for a privacy-first meeting intelligence platform using Python, Deepgram, Modal, and Google Cloud Storage.",
        "<b>Virtue Poker Multichain Platform:</b> Core backend engineer delivering <b>161+ merged PRs over 2 years</b> across Python game-state engines, multichain wallet &amp; smart contract integrations (Ethereum, Solana, Base, Linea), and automated E2E test suites.",
        "<b>Applied AI, Enterprise Dashboards &amp; Solana Infrastructure:</b> Delivered Next.js/GraphQL justice analytics dashboards (Recidiviz), AI reporting automation (n8n + Zulip + LiteLLM), a real-time Colombian Sign Language translator (MediaPipe + TFLite + FastAPI), and <b>10+ production Solana/Metaplex</b> NFT candy machine deployments.",
    ]
    for b in monadical_bullets:
        story.append(bullet(b, styles))

    story.append(Spacer(1, 2.5))

    # Datagran
    story.append(
        role_header(
            "Datagran",
            "Full Stack Software Engineer",
            "2018 - 2020",
            "Remote",
            styles,
            content_width,
        )
    )
    datagran_bullets = [
        "Architected visual data-pipeline builder UIs, high-throughput REST APIs, and interactive analytics dashboards for an enterprise SaaS Big Data &amp; Machine Learning platform serving Fortune 500 and mid-market clients.",
        "Engineered end-to-end third-party data source connectors and real-time visualization components in React and Node.js/Python, reducing pipeline configuration friction across the full product lifecycle.",
    ]
    for b in datagran_bullets:
        story.append(bullet(b, styles))

    story.append(Spacer(1, 2.5))

    # Greensill
    story.append(
        role_header(
            "Greensill",
            "Backend Software Engineer",
            "2017 - 2018",
            "Remote",
            styles,
            content_width,
        )
    )
    greensill_bullets = [
        "Designed and maintained resilient RESTful backend services and transactional workflows for an e-commerce and supply-chain operations platform, optimizing SQL query performance and third-party payment/logistics integrations.",
    ]
    for b in greensill_bullets:
        story.append(bullet(b, styles))

    # 5. SELECTED OPEN SOURCE CONTRIBUTIONS
    story.extend(section_header("Selected Open Source Contributions", styles))
    oss_items = [
        (
            "GreyhavenHQ / greywall &amp; greyproxy (184+ GitHub Stars) &mdash; <a href='https://github.com/GreyhavenHQ/greywall' color='#1D4ED8'>github.com/GreyhavenHQ/greywall</a>",
            "Go, Wails, Linux Landlock/seccomp, macOS CGO: Deny-by-default AI coding agent sandbox with kernel-level isolation, SOCKS5/DNS filtering proxy, and cross-platform native desktop companion.",
        ),
        (
            "GreyhavenHQ / reflector (49+ GitHub Stars) &mdash; <a href='https://github.com/GreyhavenHQ/reflector' color='#1D4ED8'>github.com/GreyhavenHQ/reflector</a>",
            "Python, Deepgram, Modal, FFmpeg: Self-hosted local ML meeting transcription and audio diarization platform with speaker merge workflows.",
        ),
        (
            "scope3data / scope3ai-py (27 Merged PRs) &mdash; <a href='https://github.com/scope3data/scope3ai-py' color='#1D4ED8'>github.com/scope3data/scope3ai-py</a>",
            "Python SDK Engineering: Built async and multimodal environmental impact tracers for OpenAI, HuggingFace, LiteLLM, and MistralAI with PyVcr test suites.",
        ),
        (
            "metaplex-foundation / metaplex (3,355+ GitHub Stars, 8 Merged PRs) &amp; safe-global / safe-modules-deployments",
            "TypeScript, Solana, EVM Smart Contracts: Core protocol contributions to the standard Solana NFT framework and Safe smart account module deployments.",
        ),
    ]
    for title_html, desc_html in oss_items:
        story.append(Paragraph(title_html, styles["oss_title"]))
        story.append(Paragraph(desc_html, styles["oss_desc"]))

    # 6. EDUCATION & LANGUAGES (2-Column Footer Table for Compact 1-Page Balance)
    story.extend(section_header("Education & Languages", styles))
    edu_left = (
        "<b>Information Systems Technologist</b> &mdash; Universidad del Valle, Cali, Colombia<br/>"
        "<b>B.A. in Psychology</b> (9th Semester, in progress) &mdash; Universidad EAN"
    )
    edu_right = (
        "<b>Spanish:</b> Native Speaker<br/>"
        "<b>English:</b> Professional Working Proficiency (B2)"
    )
    edu_tbl = Table(
        [[Paragraph(edu_left, styles["skill_val"]), Paragraph(edu_right, styles["skill_val"])]],
        colWidths=[content_width * 0.65, content_width * 0.35],
    )
    edu_tbl.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]
        )
    )
    story.append(edu_tbl)

    doc.build(story)


def build_2page_extended(output_path: Path):
    """Build the 2-Page Extended Senior/Staff Architecture & Case Studies Edition."""
    margin_x = 0.52 * inch
    margin_y = 0.45 * inch
    content_width = letter[0] - (2 * margin_x)
    styles = make_styles(compact=False)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=margin_x,
        rightMargin=margin_x,
        topMargin=margin_y,
        bottomMargin=margin_y,
        title="Kevin Guevara Devia — Senior Full Stack Software Engineer CV (Extended)",
        author="Kevin Guevara Devia",
        subject="Senior Full Stack Software Engineer Resume (2-Page Extended Edition)",
    )

    story = []

    # PAGE 1: HEADER, SUMMARY, TECHNICAL SKILLS, PROFESSIONAL EXPERIENCE
    story.append(Paragraph("Kevin Guevara Devia", styles["name"]))
    story.append(
        Paragraph(
            "Senior Full Stack Software Engineer &nbsp;&bull;&nbsp; Fintech / Stablecoin Rails, Applied AI &amp; Distributed Systems",
            styles["title"],
        )
    )
    contact_html = (
        "Cali, Colombia (Remote UTC-5) &nbsp;&bull;&nbsp; "
        "<a href='mailto:kevinguevaradevia@gmail.com' color='#1D4ED8'>kevinguevaradevia@gmail.com</a> &nbsp;&bull;&nbsp; "
        "+57 302 406 7155 &nbsp;&bull;&nbsp; "
        "<a href='https://linkedin.com/in/kev-guevara' color='#1D4ED8'>linkedin.com/in/kev-guevara</a> &nbsp;&bull;&nbsp; "
        "<a href='https://github.com/kevdevg' color='#1D4ED8'>github.com/kevdevg</a> &nbsp;&bull;&nbsp; "
        "<a href='https://kevdevg.github.io/portfolio/' color='#1D4ED8'>kevdevg.github.io/portfolio</a>"
    )
    story.append(Paragraph(contact_html, styles["contact"]))

    story.extend(section_header("Executive Summary", styles))
    story.append(
        Paragraph(
            "Senior Full Stack Software Engineer with <b>9+ years</b> owning end-to-end architecture, backend reliability, "
            "and frontend craft across regulated stablecoin payment platforms, applied AI/ML systems, multichain Web3 protocols, "
            "and cross-platform desktop security software. Author of <b>367+ merged pull requests</b> and <b>4,000+ contributions</b> "
            "across 35+ production repositories (47% TypeScript, 12% Rust, 10% Python, 10% JavaScript, Go &amp; Solidity). "
            "Combines deep systems engineering with human-centered product perspective informed by dual training in Information Systems and Psychology.",
            styles["summary"],
        )
    )

    story.extend(section_header("Core Technical Stack", styles))
    skills_data = [
        ("Languages:", "TypeScript, JavaScript (ES2024), Python, Go (Golang), SQL, Rust, Solidity, Objective-C (CGO)"),
        ("Frontend Architecture:", "React 19, Next.js, Vite, Tailwind CSS, Zustand, Redux Toolkit, GraphQL, React Three Fiber / WebGL"),
        ("Backend & Distributed:", "NestJS, FastAPI, Node.js, Prisma ORM, PostgreSQL, Redis, BullMQ, Idempotent Webhooks & Event Queues"),
        ("Fintech & Web3 Rails:", "Solana, Ethereum / EVM (Base, Linea, PulseChain), Brale Treasury API, Coinflow, Metaplex, DFNS Wallet Infra"),
        ("Applied AI & Vision:", "LLM Orchestration (Claude, OpenAI, LiteLLM, LangGraph, n8n), Deepgram ASR, MediaPipe, TensorFlow Lite, FFmpeg"),
        ("Systems & Cloud Infra:", "Go Wails Desktop, Linux Landlock/seccomp Sandboxing, Docker, GCP, Modal Serverless, Coolify, GitHub Actions, Cloudflare"),
    ]
    skill_rows = [
        [Paragraph(cat, styles["skill_cat"]), Paragraph(val, styles["skill_val"])]
        for cat, val in skills_data
    ]
    skill_tbl = Table(skill_rows, colWidths=[1.35 * inch, content_width - 1.35 * inch])
    skill_tbl.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 1.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
            ]
        )
    )
    story.append(skill_tbl)

    story.extend(section_header("Professional Experience", styles))

    # Monadical
    story.append(
        role_header(
            "Monadical",
            "Senior Full Stack Software Engineer",
            "2020 - Present",
            "Remote",
            styles,
            content_width,
        )
    )
    monadical_bullets = [
        "<b>Agricultural Stablecoin Payments Platform (SpudPay) — Lead Developer:</b> Owned full-stack architecture and delivery (React 19, Vite, NestJS 10, Prisma 6, PostgreSQL, Redis) on Brale's Treasury infrastructure; implemented Coinflow card-to-USDC settlement, stablecoin issuance, automated submerchant KYB onboarding, and webhook-driven ledger reconciliation across <b>28+ merged PRs</b>.",
        "<b>TicketNetwork Programmable Stablecoin Controller:</b> Architected and maintained programmable stablecoin payment routing, settlement state machines, and treasury automation in TypeScript across <b>100+ production commits</b> for a major secondary ticket marketplace.",
        "<b>Greywall &amp; Greyproxy Security Ecosystem:</b> Core contributor (<b>74+ commits</b> across Go, Wails, and React/TypeScript) to a cross-platform native desktop companion app, implementing macOS system tray controls via CGO/Objective-C (NSStatusItem), embedded greyproxy binary installation, and local app discovery.",
        "<b>Reflector On-Premise ML Transcription Platform:</b> Engineered audio diarization pipelines, speaker merge tooling, and FFmpeg preprocessing workflows for a 100% local/self-hosted ML meeting intelligence system using Python, Deepgram, Modal, and Google Cloud Storage.",
        "<b>Virtue Poker Multichain Platform:</b> Core backend developer with <b>161+ merged PRs over 2 years</b>, building decentralized poker game-state engines in Python, multichain wallet &amp; contract integrations (Ethereum, Solana, Base, Linea, PulseChain), and automated Cypress/E2E verification suites.",
        "<b>Enterprise Client Engineering &amp; Applied AI:</b> Delivered criminal-justice data portals in Next.js/React/GraphQL (Recidiviz), autonomous AI reporting agents (n8n + Zulip + LiteLLM), a real-time Colombian Sign Language (LSC) computer-vision translator (MediaPipe + TFLite + FastAPI), and <b>10+ production Solana/Metaplex</b> NFT candy machine launches.",
    ]
    for b in monadical_bullets:
        story.append(bullet(b, styles))

    story.append(Spacer(1, 5))

    # Datagran
    story.append(
        role_header(
            "Datagran",
            "Full Stack Software Engineer",
            "2018 - 2020",
            "Remote",
            styles,
            content_width,
        )
    )
    datagran_bullets = [
        "Designed and shipped full-stack features for an enterprise SaaS Big Data and Machine Learning automation platform, building interactive directed-acyclic-graph (DAG) data pipeline UIs and backend orchestration APIs.",
        "Built real-time data visualization dashboards and third-party ingestion connectors across the full product lifecycle, enabling enterprise analytics teams to deploy ML workflows without manual infrastructure setup.",
    ]
    for b in datagran_bullets:
        story.append(bullet(b, styles))

    story.append(Spacer(1, 5))

    # Greensill
    story.append(
        role_header(
            "Greensill",
            "Backend Software Engineer",
            "2017 - 2018",
            "Remote",
            styles,
            content_width,
        )
    )
    greensill_bullets = [
        "Developed and maintained backend microservices and RESTful APIs for an e-commerce and working-capital platform, executing relational database query optimizations and third-party payment/ERP integrations.",
    ]
    for b in greensill_bullets:
        story.append(bullet(b, styles))

    # PAGE 2: ARCHITECTURAL CASE STUDIES, OPEN SOURCE, EDUCATION & LANGUAGES
    story.append(PageBreak())

    story.extend(section_header("Selected Architecture & Systems Case Studies", styles))
    case_studies = [
        (
            "SpudPay &amp; TicketNetwork &mdash; Regulated Stablecoin Settlement &amp; Treasury Infrastructure",
            "<b>Stack:</b> TypeScript, React 19, NestJS, Prisma, PostgreSQL, Redis, Brale Treasury API, Coinflow, Solana",
            "Designed dual-rail payment orchestration bridging traditional card acquiring (Coinflow) with programmable stablecoin minting/redemption (Brale). Implemented strict webhook signature verification, idempotent ledger transitions, automated KYB compliance state machines, and mobile-ready checkout experiences passing Apple App Store compliance.",
        ),
        (
            "Greywall &amp; Greyproxy Companion &mdash; Kernel-Isolated AI Agent Sandbox &amp; Native Desktop Control",
            "<b>Stack:</b> Go (Golang), Wails, React, TypeScript, CGO / Objective-C (macOS NSStatusItem), Linux Landlock &amp; seccomp",
            "Engineered the cross-platform desktop control plane and native macOS status bar companion for GreyhavenHQ's deny-by-default sandbox. Integrated embedded proxy lifecycle management, real-time network rule notifications, and zero-dependency native system tray menus.",
        ),
        (
            "Reflector &amp; Real-Time LSC Sign Language Translator &mdash; Applied Speech &amp; Vision ML Pipelines",
            "<b>Stack:</b> Python, FastAPI, Deepgram, Modal Serverless, FFmpeg, MediaPipe, TensorFlow Lite, GCS",
            "Built low-latency multimodal inference pipelines: (1) an asynchronous FFmpeg + Deepgram + Modal speaker diarization and transcript merge engine for long-form multi-speaker meetings, and (2) a sub-100ms browser-to-FastAPI hand-landmark classification pipeline translating Colombian Sign Language gestures in real time.",
        ),
        (
            "Virtue Poker &amp; Metaplex Ecosystem &mdash; High-Concurrency Web3 Game State &amp; Protocol Tooling",
            "<b>Stack:</b> Python, TypeScript, Solidity, Rust/Solana, React, Redux, WebSockets, Docker",
            "Delivered 161+ merged PRs maintaining off-chain game state synchronization, cryptographic hand verification, and multi-network wallet bridging for Virtue Poker, alongside 8 core PRs to the Metaplex Foundation protocol (3,355+ stars) and 10+ high-demand NFT minting infrastructures.",
        ),
    ]
    for cs_title, cs_stack, cs_body in case_studies:
        story.append(Paragraph(cs_title, styles["oss_title"]))
        story.append(Paragraph(f"<font color='#1D4ED8'>{cs_stack}</font>", styles["oss_desc"]))
        story.append(Paragraph(cs_body, styles["oss_desc"]))
        story.append(Spacer(1, 2))

    story.extend(section_header("Selected Open Source Contributions", styles))
    oss_extended = [
        (
            "GreyhavenHQ / greywall (184+ Stars) &amp; greyproxy (35+ Stars) &mdash; <a href='https://github.com/GreyhavenHQ/greywall' color='#1D4ED8'>github.com/GreyhavenHQ/greywall</a>",
            "Core contributor (74+ commits across greywall, greyproxy, Wails desktop app, and docs). Built cross-platform companion app, native macOS tray integration, and embedded installer workflows for a deny-by-default AI agent sandbox.",
        ),
        (
            "GreyhavenHQ / reflector (49+ Stars) &mdash; <a href='https://github.com/GreyhavenHQ/reflector' color='#1D4ED8'>github.com/GreyhavenHQ/reflector</a>",
            "Core contributor to a 100% self-hosted ML audio transcription and meeting intelligence platform. Engineered speaker diarization and transcript merge tooling with Python, Deepgram, and Modal.",
        ),
        (
            "scope3data / scope3ai-py (27 Merged PRs) &mdash; <a href='https://github.com/scope3data/scope3ai-py' color='#1D4ED8'>github.com/scope3data/scope3ai-py</a>",
            "Major contributor to the official Python SDK for Scope3's AI carbon &amp; water footprint tracking API. Delivered sync/async wrappers, multimodal token accounting, and provider integrations for OpenAI, HuggingFace, LiteLLM, and MistralAI.",
        ),
        (
            "metaplex-foundation / metaplex (3,355+ Stars, 8 Merged PRs) &mdash; <a href='https://github.com/metaplex-foundation/metaplex' color='#1D4ED8'>github.com/metaplex-foundation/metaplex</a>",
            "Contributed 8 merged PRs to the flagship NFT and digital asset standard on Solana, improving storefront and Candy Machine reliability during peak ecosystem adoption.",
        ),
        (
            "safe-global / safe-modules-deployments (15+ Stars) &mdash; <a href='https://github.com/safe-global/safe-modules-deployments' color='#1D4ED8'>github.com/safe-global/safe-modules-deployments</a>",
            "Contributed smart contract module deployment configurations and multi-network verification artifacts for the Safe (formerly Gnosis Safe) smart account ecosystem.",
        ),
    ]
    for title_html, desc_html in oss_extended:
        story.append(Paragraph(title_html, styles["oss_title"]))
        story.append(Paragraph(desc_html, styles["oss_desc"]))

    story.extend(section_header("Education & Interdisciplinary Background", styles))
    story.append(
        role_header(
            "Universidad del Valle",
            "Information Systems Technologist (Tecnólogo en Sistemas de Información)",
            "Graduated",
            "Cali, Colombia",
            styles,
            content_width,
        )
    )
    story.append(
        bullet(
            "Core focus on software engineering, relational databases, algorithms, computer networks, and systems architecture.",
            styles,
        )
    )
    story.append(Spacer(1, 3))
    story.append(
        role_header(
            "Universidad EAN",
            "B.A. in Psychology (9th Semester, in progress)",
            "In Progress",
            "Colombia",
            styles,
            content_width,
        )
    )
    story.append(
        bullet(
            "Focus on cognitive psychology, behavioral science, psychometrics, and human-computer interaction — applied to developer experience (DX), AI agent workflows, and high-conversion product interfaces.",
            styles,
        )
    )

    story.extend(section_header("Languages & Professional Telemetry", styles))
    lang_bullets = [
        "<b>Languages:</b> Spanish (Native) &nbsp;&bull;&nbsp; English (Professional Working Proficiency — B2, 8+ years in English-first distributed engineering teams).",
        "<b>Verified GitHub Footprint:</b> 4,000+ total contributions &nbsp;&bull;&nbsp; 367+ merged PRs &nbsp;&bull;&nbsp; 35+ organization repositories across Monadical-SAS, GreyhavenHQ, scope3data, metaplex-foundation, and safe-global.",
    ]
    for lb in lang_bullets:
        story.append(bullet(lb, styles))

    doc.build(story)


def main():
    base_dir = Path("/Users/kevinguevara/Documents/Me")
    portfolio_pub = Path("/Users/kevinguevara/porfolio/public")

    cv_1page_path = base_dir / "Kevin_Guevara_CV_1Page_ATS.pdf"
    cv_main_path = base_dir / "Kevin_Guevara_CV.pdf"
    cv_2page_path = base_dir / "Kevin_Guevara_CV_2Page_Extended.pdf"

    build_1page_ats(cv_1page_path)
    shutil.copy2(cv_1page_path, cv_main_path)
    build_2page_extended(cv_2page_path)

    if portfolio_pub.exists():
        shutil.copy2(cv_1page_path, portfolio_pub / "Kevin_Guevara_CV.pdf")
        shutil.copy2(cv_2page_path, portfolio_pub / "Kevin_Guevara_CV_Extended.pdf")

    print("Successfully generated:")
    print(f" - {cv_main_path} ({cv_main_path.stat().st_size} bytes)")
    print(f" - {cv_1page_path} ({cv_1page_path.stat().st_size} bytes)")
    print(f" - {cv_2page_path} ({cv_2page_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
