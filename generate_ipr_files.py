import os
from fpdf import FPDF
import zipfile

uploads_dir = r'D:\Antigravity\velourcare-ortho-cloud\public\uploads'
os.makedirs(uploads_dir, exist_ok=True)

class IPRPDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(26, 43, 76)
        self.cell(0, 10, 'VELOURCARE ORTHO - TREATMENT PLAN & IPR PROTOCOL', border=False, ln=True, align='C')
        self.set_font('Helvetica', '', 10)
        self.set_text_color(100, 110, 130)
        self.cell(0, 5, 'Interproximal Reduction (IPR) & Attachment Staging Verification Sheet', border=False, ln=True, align='C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, 'VelourCare Orthodontics Medical Cloud | Verification ID: VELOUR-IPR-984210 | Page %s' % self.page_no(), 0, 0, 'C')

pdf = IPRPDF()
pdf.add_page()

# Case Information Box
pdf.set_fill_color(245, 247, 250)
pdf.set_draw_color(220, 225, 235)
pdf.rect(10, 30, 190, 32, 'DF')

pdf.set_xy(14, 34)
pdf.set_font('Helvetica', 'B', 10)
pdf.set_text_color(40, 50, 70)
pdf.cell(45, 6, 'Patient Name:', 0, 0)
pdf.set_font('Helvetica', '', 10)
pdf.cell(50, 6, 'Fatima Al-Nuaimi (26Y)', 0, 0)

pdf.set_font('Helvetica', 'B', 10)
pdf.cell(40, 6, 'Case ID:', 0, 0)
pdf.set_font('Helvetica', '', 10)
pdf.cell(45, 6, 'VELOUR-0001', 0, 1)

pdf.set_x(14)
pdf.set_font('Helvetica', 'B', 10)
pdf.cell(45, 6, 'Treating Doctor:', 0, 0)
pdf.set_font('Helvetica', '', 10)
pdf.cell(50, 6, 'Dr. Alexander Wright', 0, 0)

pdf.set_font('Helvetica', 'B', 10)
pdf.cell(40, 6, 'Clinic / Center:', 0, 0)
pdf.set_font('Helvetica', '', 10)
pdf.cell(45, 6, 'Wright Orthodontics Clinic', 0, 1)

pdf.set_x(14)
pdf.set_font('Helvetica', 'B', 10)
pdf.cell(45, 6, 'Aligners Prescription:', 0, 0)
pdf.set_font('Helvetica', '', 10)
pdf.cell(50, 6, '22 Upper / 18 Lower (10-Day)', 0, 0)

pdf.set_font('Helvetica', 'B', 10)
pdf.cell(40, 6, 'Total IPR Cumulative:', 0, 0)
pdf.set_font('Helvetica', 'B', 10)
pdf.set_text_color(10, 179, 156)
pdf.cell(45, 6, '1.20 mm', 0, 1)

pdf.ln(12)

# Section: IPR Protocol Table
pdf.set_font('Helvetica', 'B', 12)
pdf.set_text_color(26, 43, 76)
pdf.cell(0, 8, 'INTERPROXIMAL ENAMEL REDUCTION (IPR) SCHEDULE', 0, 1)

# Table Header
pdf.set_fill_color(10, 179, 156)
pdf.set_text_color(255, 255, 255)
pdf.set_font('Helvetica', 'B', 9)
pdf.cell(20, 8, 'Arch', 1, 0, 'C', fill=True)
pdf.cell(35, 8, 'Contact Pair (FDI)', 1, 0, 'C', fill=True)
pdf.cell(30, 8, 'Reduction (mm)', 1, 0, 'C', fill=True)
pdf.cell(35, 8, 'Timing (After Step)', 1, 0, 'C', fill=True)
pdf.cell(70, 8, 'Clinical Instructions / Strip Type', 1, 1, 'C', fill=True)

# Table Rows
ipr_data = [
    ('Maxillary', '11 - 21 (Centrals)', '0.30 mm', 'After Step 03', 'Diamond single-sided, finish with polishing strip'),
    ('Maxillary', '21 - 22 (Central-Lat)', '0.20 mm', 'After Step 03', 'Medium flexible strip, verify with 0.20mm gauge'),
    ('Maxillary', '12 - 11 (Lat-Central)', '0.20 mm', 'After Step 05', 'Medium flexible strip, verify with 0.20mm gauge'),
    ('Mandibular', '31 - 41 (Centrals)', '0.20 mm', 'After Step 02', 'Ultra-fine double-sided, confirm contact relief'),
    ('Mandibular', '41 - 42 (Central-Lat)', '0.30 mm', 'After Step 04', 'Diamond abrasive, verify with 0.30mm leaf gauge')
]

pdf.set_font('Helvetica', '', 9)
for idx, row in enumerate(ipr_data):
    if idx % 2 == 0:
        pdf.set_fill_color(255, 255, 255)
    else:
        pdf.set_fill_color(248, 249, 250)
    pdf.set_text_color(40, 50, 70)
    pdf.cell(20, 7, row[0], 1, 0, 'C', fill=True)
    pdf.cell(35, 7, row[1], 1, 0, 'C', fill=True)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(220, 53, 69)
    pdf.cell(30, 7, row[2], 1, 0, 'C', fill=True)
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(40, 50, 70)
    pdf.cell(35, 7, row[3], 1, 0, 'C', fill=True)
    pdf.cell(70, 7, row[4], 1, 1, 'L', fill=True)

pdf.ln(8)

# Attachment Schedule
pdf.set_font('Helvetica', 'B', 12)
pdf.set_text_color(26, 43, 76)
pdf.cell(0, 8, 'COMPOSITE ATTACHMENT PLACEMENT PROTOCOL', 0, 1)

pdf.set_fill_color(64, 81, 137)
pdf.set_text_color(255, 255, 255)
pdf.set_font('Helvetica', 'B', 9)
pdf.cell(25, 8, 'Tooth # (FDI)', 1, 0, 'C', fill=True)
pdf.cell(40, 8, 'Attachment Geometry', 1, 0, 'C', fill=True)
pdf.cell(35, 8, 'Placement Step', 1, 0, 'C', fill=True)
pdf.cell(90, 8, 'Biomechanical Purpose', 1, 1, 'C', fill=True)

att_data = [
    ('13 (Upper R Canine)', '3mm Vertical Rectangular', 'Step 01 (Template)', 'Root angulation & distal tip retention'),
    ('23 (Upper L Canine)', '3mm Vertical Rectangular', 'Step 01 (Template)', 'Root angulation & rotational control'),
    ('33 (Lower L Canine)', '2.5mm Optimized Beveled', 'Step 02 (Template)', 'Extrusion and anchorage reinforcement'),
    ('43 (Lower R Canine)', '2.5mm Optimized Beveled', 'Step 02 (Template)', 'Extrusion and arch expansion guidance')
]

pdf.set_font('Helvetica', '', 9)
for idx, row in enumerate(att_data):
    if idx % 2 == 0:
        pdf.set_fill_color(255, 255, 255)
    else:
        pdf.set_fill_color(248, 249, 250)
    pdf.set_text_color(40, 50, 70)
    pdf.cell(25, 7, row[0], 1, 0, 'C', fill=True)
    pdf.cell(40, 7, row[1], 1, 0, 'C', fill=True)
    pdf.cell(35, 7, row[2], 1, 0, 'C', fill=True)
    pdf.cell(90, 7, row[3], 1, 1, 'L', fill=True)

pdf.ln(10)

# Sign-off box
pdf.set_draw_color(180, 190, 205)
pdf.rect(10, 220, 190, 35)
pdf.set_xy(14, 224)
pdf.set_font('Helvetica', 'B', 9)
pdf.cell(0, 5, 'CLINICAL VERIFICATION & DOCTOR SIGN-OFF:', 0, 1)
pdf.set_font('Helvetica', '', 8)
pdf.cell(0, 5, 'I verify that the above IPR values and attachment locations have been clinically performed and approved according to the protocol.', 0, 1)
pdf.ln(6)
pdf.cell(80, 5, 'Doctor Signature: _________________________________', 0, 0)
pdf.cell(60, 5, 'Date: ________________________', 0, 1)

# Save PDF
pdf_path_1 = os.path.join(uploads_dir, 'velourcare-ipr-chart-sample.pdf')
pdf_path_2 = os.path.join(uploads_dir, 'sample-ipr-chart-protocol.pdf')
pdf.output(pdf_path_1)
pdf.output(pdf_path_2)
print("Created PDF:", pdf_path_1)
print("Created PDF:", pdf_path_2)

# Create dummy sample-treatment-container.o3c
o3c_path = os.path.join(uploads_dir, 'sample-treatment-container.o3c')
with open(o3c_path, 'wb') as f:
    f.write(b'VELOURCARE-ORTHO-O3C-CONTAINER-BINARY-SIMULATION-DATA-V2.4\n' + b'\x00' * 1024)
print("Created O3C container:", o3c_path)

# Create dummy sample-treatment-models.zip
zip_path = os.path.join(uploads_dir, 'sample-treatment-models.zip')
with zipfile.ZipFile(zip_path, 'w') as zf:
    zf.writestr('upper_step_01.stl', 'solid velourcare_upper_01\nendsolid\n')
    zf.writestr('lower_step_01.stl', 'solid velourcare_lower_01\nendsolid\n')
    zf.writestr('ipr_protocol_manifest.json', '{"case_id":"VELOUR-0001","ipr_total":1.20}\n')
print("Created Models ZIP:", zip_path)
