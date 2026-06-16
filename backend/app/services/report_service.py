import hashlib
import uuid
from datetime import datetime, timezone
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.repositories.emission_repository import EmissionRepository
from app.schemas.report import ReportResponse


class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.emission_repo = EmissionRepository(db)

    def generate_pdf_report(
        self, user_id: uuid.UUID, date_from, date_to, include_recommendations: bool = True
    ) -> bytes:
        user = self.user_repo.get(user_id)
        breakdown = self.emission_repo.get_category_breakdown(user_id)
        total = sum(breakdown.values())

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4, topMargin=0.5 * inch, bottomMargin=0.5 * inch
        )
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle(
            "TitleCustom",
            parent=styles["Title"],
            fontSize=22,
            textColor=HexColor("#10b981"),
            spaceAfter=6,
        )
        heading_style = ParagraphStyle(
            "HeadingCustom",
            parent=styles["Heading2"],
            fontSize=14,
            textColor=HexColor("#065f46"),
            spaceAfter=8,
            spaceBefore=16,
        )

        story.append(Paragraph("CarbonVerse AI", title_style))
        story.append(Paragraph("Sustainability Report", styles["Title"]))
        story.append(Spacer(1, 12))

        story.append(
            Paragraph(f"User: {user.username if user else 'N/A'}", styles["Normal"])
        )
        story.append(
            Paragraph(f"Email: {user.email if user else 'N/A'}", styles["Normal"])
        )
        story.append(
            Paragraph(f"Report Period: {date_from} to {date_to}", styles["Normal"])
        )
        story.append(
            Paragraph(
                f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
                styles["Normal"],
            )
        )
        story.append(Spacer(1, 20))

        story.append(Paragraph("Emission Summary", heading_style))
        story.append(
            Paragraph(
                f"Total Carbon Footprint: {total:.2f} kg CO2", styles["Normal"]
            )
        )
        story.append(
            Paragraph(
                f"Sustainability Score: {user.sustainability_score if user else 0}/100",
                styles["Normal"],
            )
        )
        story.append(
            Paragraph(
                f"Green Level: {user.green_level if user else 1}/5", styles["Normal"]
            )
        )
        story.append(Spacer(1, 12))

        story.append(Paragraph("Category Breakdown", heading_style))
        table_data = [["Category", "Emissions (kg CO2)", "Percentage"]]
        for cat, value in breakdown.items():
            pct = (value / total * 100) if total > 0 else 0
            table_data.append([cat.title(), f"{value:.2f}", f"{pct:.1f}%"])

        table = Table(table_data, colWidths=[2.5 * inch, 2 * inch, 1.5 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#10b981")),
            ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 11),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
            ("BACKGROUND", (0, 1), (-1, -1), HexColor("#f0fdf4")),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#86efac")),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))

        if include_recommendations:
            story.append(Paragraph("Personalized Recommendations", heading_style))
            recommendations: list[str] = []
            for cat, value in breakdown.items():
                if value > total * 0.2:
                    recommendations.append(
                        f"Focus on reducing {cat} emissions - consider sustainable alternatives"
                    )
            recommendations.extend([
                "Track your emissions daily for better insights",
                "Set weekly reduction goals to stay motivated",
                "Share your progress to inspire others",
            ])
            for i, rec in enumerate(recommendations[:5], 1):
                story.append(Paragraph(f"{i}. {rec}", styles["Normal"]))

        doc.build(story)
        return buffer.getvalue()

    def generate_report_response(
        self, user_id: uuid.UUID, date_from, date_to, include_recommendations: bool = True
    ) -> ReportResponse:
        report_bytes = self.generate_pdf_report(
            user_id, date_from, date_to, include_recommendations
        )
        report_hash = hashlib.sha256(report_bytes).hexdigest()[:16]

        return ReportResponse(
            id=report_hash,
            user_id=user_id,
            generated_at=datetime.now(timezone.utc),
            report_url=f"/api/v1/reports/{report_hash}/download",
            date_from=date_from,
            date_to=date_to,
        )
