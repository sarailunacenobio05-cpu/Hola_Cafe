package com.holacafe.service;

import com.holacafe.dto.EnviarWhatsAppRequest;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class TicketPdfService {

    private static final Color COLOR_CAFE_OSCURO = new Color(30, 17, 10);     // #1E110A
    private static final Color COLOR_CAFE_MARCA = new Color(123, 63, 0);      // #7B3F00
    private static final Color COLOR_GRIS_TEXTO = new Color(110, 90, 78);     // #6E5A4E
    private static final Color COLOR_CREMA_FONDO = new Color(250, 248, 245);  // #FAF8F5
    private static final Color COLOR_BORDE = new Color(229, 220, 211);        // #E5DCD3
    private static final Color COLOR_TOTAL_BG = new Color(255, 247, 237);     // #FFF7ED
    private static final Color COLOR_ROJO = new Color(211, 47, 47);           // #D32F2F

    public byte[] generarTicketPdf(EnviarWhatsAppRequest req) {
        List<EnviarWhatsAppRequest.ItemTicket> items = req.getItems();
        int cantItems = (items != null) ? items.size() : 0;

        // Altura dinámica proporcional a los artículos para que luzca como ticket digital elegante
        float pageHeight = Math.max(520f, 430f + (cantItems * 28f));
        Rectangle pageSize = new Rectangle(320f, pageHeight);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(pageSize, 22f, 22f, 22f, 22f);
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, COLOR_CAFE_OSCURO);
            Font fontSubtitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COLOR_CAFE_MARCA);
            Font fontChico = FontFactory.getFont(FontFactory.HELVETICA, 8, COLOR_GRIS_TEXTO);
            Font fontLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, COLOR_GRIS_TEXTO);
            Font fontValor = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, COLOR_CAFE_OSCURO);
            Font fontItem = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COLOR_CAFE_OSCURO);
            Font fontItemDetalle = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, COLOR_GRIS_TEXTO);
            Font fontTotalLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, COLOR_CAFE_OSCURO);
            Font fontTotalMonto = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, COLOR_CAFE_MARCA);

            // 1. Logo de ¡Hola, Café!
            try {
                ClassPathResource logoRes = new ClassPathResource("static/logo.png");
                if (logoRes.exists()) {
                    Image logo = Image.getInstance(logoRes.getInputStream().readAllBytes());
                    logo.scaleToFit(74f, 74f);
                    logo.setAlignment(Element.ALIGN_CENTER);
                    logo.setSpacingAfter(4f);
                    doc.add(logo);
                }
            } catch (Exception ignored) { }

            // 2. Encabezado del negocio
            Paragraph pBrand = new Paragraph("¡Hola, Café!", fontTitulo);
            pBrand.setAlignment(Element.ALIGN_CENTER);
            doc.add(pBrand);

            Paragraph pSub = new Paragraph("Café Central · Comprobante de Consumo", fontSubtitulo);
            pSub.setAlignment(Element.ALIGN_CENTER);
            pSub.setSpacingAfter(10f);
            doc.add(pSub);

            // 3. Tarjeta de metadatos (Folio, Mesa, Mesero, Método, Fecha)
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setWidths(new float[]{42f, 58f});
            metaTable.setSpacingAfter(10f);

            agregarFilaMeta(metaTable, "Folio:", valorSeguro(req.getFolio(), "#0000"), fontLabel, fontValor);
            agregarFilaMeta(metaTable, "Mesa:", valorSeguro(req.getMesa(), "Mesa"), fontLabel, fontValor);
            agregarFilaMeta(metaTable, "Mesero:", valorSeguro(req.getMesero(), "Personal"), fontLabel, fontValor);
            agregarFilaMeta(metaTable, "Pagado con:", valorSeguro(req.getMetodoPago(), "Caja"), fontLabel, fontValor);
            agregarFilaMeta(metaTable, "Fecha:", valorSeguro(req.getFecha(), "Hoy"), fontLabel, fontValor);

            PdfPTable metaWrapper = new PdfPTable(1);
            metaWrapper.setWidthPercentage(100);
            metaWrapper.setSpacingAfter(10f);
            PdfPCell wrapCell = new PdfPCell(metaTable);
            wrapCell.setBackgroundColor(COLOR_CREMA_FONDO);
            wrapCell.setBorderColor(COLOR_BORDE);
            wrapCell.setBorderWidth(0.8f);
            wrapCell.setPadding(8f);
            metaWrapper.addCell(wrapCell);
            doc.add(metaWrapper);

            // 4. Tabla de artículos
            PdfPTable itemsTable = new PdfPTable(2);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{70f, 30f});
            itemsTable.setSpacingAfter(10f);

            PdfPCell thDesc = new PdfPCell(new Phrase("CANT. · PRODUCTO", fontLabel));
            thDesc.setBorder(Rectangle.BOTTOM);
            thDesc.setBorderColor(COLOR_BORDE);
            thDesc.setPaddingBottom(5f);
            itemsTable.addCell(thDesc);

            PdfPCell thAmt = new PdfPCell(new Phrase("IMPORTE", fontLabel));
            thAmt.setHorizontalAlignment(Element.ALIGN_RIGHT);
            thAmt.setBorder(Rectangle.BOTTOM);
            thAmt.setBorderColor(COLOR_BORDE);
            thAmt.setPaddingBottom(5f);
            itemsTable.addCell(thAmt);

            if (items != null && !items.isEmpty()) {
                for (int i = 0; i < items.size(); i++) {
                    EnviarWhatsAppRequest.ItemTicket item = items.get(i);
                    Color rowBg = (i % 2 == 1) ? COLOR_CREMA_FONDO : Color.WHITE;

                    Paragraph pItem = new Paragraph();
                    pItem.add(new Chunk((item.getCantidad() != null ? item.getCantidad() : 1) + "× ", fontSubtitulo));
                    pItem.add(new Chunk(valorSeguro(item.getNombre(), "Producto"), fontItem));
                    if (item.getDetalle() != null && !item.getDetalle().isBlank()) {
                        pItem.add(Chunk.NEWLINE);
                        pItem.add(new Chunk(item.getDetalle(), fontItemDetalle));
                    }

                    PdfPCell cDesc = new PdfPCell(pItem);
                    cDesc.setBackgroundColor(rowBg);
                    cDesc.setBorder(Rectangle.BOTTOM);
                    cDesc.setBorderColor(new Color(242, 236, 230));
                    cDesc.setPaddingTop(5f);
                    cDesc.setPaddingBottom(5f);
                    cDesc.setPaddingLeft(3f);
                    itemsTable.addCell(cDesc);

                    PdfPCell cAmt = new PdfPCell(new Phrase(valorSeguro(item.getImporte(), "$0.00"), fontValor));
                    cAmt.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    cAmt.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    cAmt.setBackgroundColor(rowBg);
                    cAmt.setBorder(Rectangle.BOTTOM);
                    cAmt.setBorderColor(new Color(242, 236, 230));
                    cAmt.setPaddingTop(5f);
                    cAmt.setPaddingBottom(5f);
                    cAmt.setPaddingRight(3f);
                    itemsTable.addCell(cAmt);
                }
            } else {
                PdfPCell cResumen = new PdfPCell(new Phrase(valorSeguro(req.getResumen(), "Consumo en cafetería"), fontItem));
                cResumen.setColspan(2);
                cResumen.setBorder(Rectangle.NO_BORDER);
                cResumen.setPadding(6f);
                itemsTable.addCell(cResumen);
            }
            doc.add(itemsTable);

            // 5. Desglose de totales
            PdfPTable totTable = new PdfPTable(2);
            totTable.setWidthPercentage(100);
            totTable.setWidths(new float[]{60f, 40f});
            totTable.setSpacingAfter(8f);

            agregarFilaTotal(totTable, "Subtotal", valorSeguro(req.getSubtotal(), "$0.00"), fontChico, fontValor);
            if (req.getDescuentoPct() != null && req.getDescuentoPct() > 0 && req.getDescuento() != null) {
                Font fontDesc = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, COLOR_ROJO);
                agregarFilaTotal(totTable, "Descuento (" + req.getDescuentoPct() + "%)", "-" + req.getDescuento(), fontChico, fontDesc);
            }
            agregarFilaTotal(totTable, "IVA (16%)", valorSeguro(req.getIva(), "$0.00"), fontChico, fontValor);
            if (req.getPropinaPct() != null && req.getPropinaPct() > 0 && req.getPropina() != null) {
                agregarFilaTotal(totTable, "Propina (" + req.getPropinaPct() + "%)", req.getPropina(), fontChico, fontValor);
            }
            doc.add(totTable);

            // 6. Caja destacada de TOTAL PAGADO
            PdfPTable grandTotal = new PdfPTable(2);
            grandTotal.setWidthPercentage(100);
            grandTotal.setWidths(new float[]{48f, 52f});
            grandTotal.setSpacingAfter(12f);

            PdfPCell cTotLbl = new PdfPCell(new Phrase("TOTAL PAGADO", fontTotalLabel));
            cTotLbl.setBackgroundColor(COLOR_TOTAL_BG);
            cTotLbl.setBorderColor(COLOR_CAFE_MARCA);
            cTotLbl.setBorderWidth(1f);
            cTotLbl.setBorder(Rectangle.TOP | Rectangle.BOTTOM | Rectangle.LEFT);
            cTotLbl.setPadding(8f);
            cTotLbl.setVerticalAlignment(Element.ALIGN_MIDDLE);
            grandTotal.addCell(cTotLbl);

            PdfPCell cTotVal = new PdfPCell(new Phrase(valorSeguro(req.getTotal(), "$0.00 MXN"), fontTotalMonto));
            cTotVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cTotVal.setBackgroundColor(COLOR_TOTAL_BG);
            cTotVal.setBorderColor(COLOR_CAFE_MARCA);
            cTotVal.setBorderWidth(1f);
            cTotVal.setBorder(Rectangle.TOP | Rectangle.BOTTOM | Rectangle.RIGHT);
            cTotVal.setPadding(8f);
            cTotVal.setVerticalAlignment(Element.ALIGN_MIDDLE);
            grandTotal.addCell(cTotVal);
            doc.add(grandTotal);

            // 7. Pie de página
            Paragraph pGracias = new Paragraph("¡Gracias por tu visita!", fontSubtitulo);
            pGracias.setAlignment(Element.ALIGN_CENTER);
            pGracias.setSpacingAfter(2f);
            doc.add(pGracias);

            Paragraph pAviso = new Paragraph("Este ticket no es un comprobante fiscal.", fontChico);
            pAviso.setAlignment(Element.ALIGN_CENTER);
            doc.add(pAviso);

            doc.close();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo generar el ticket en PDF: " + ex.getMessage(), ex);
        }
    }

    private void agregarFilaMeta(PdfPTable table, String label, String value, Font fLabel, Font fVal) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, fLabel));
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setPaddingTop(2f);
        c1.setPaddingBottom(2f);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(value, fVal));
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setPaddingTop(2f);
        c2.setPaddingBottom(2f);
        table.addCell(c2);
    }

    private void agregarFilaTotal(PdfPTable table, String label, String value, Font fLabel, Font fVal) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, fLabel));
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setPaddingTop(2.5f);
        c1.setPaddingBottom(2.5f);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(value, fVal));
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setPaddingTop(2.5f);
        c2.setPaddingBottom(2.5f);
        table.addCell(c2);
    }

    private String valorSeguro(String value, String fallback) {
        return (value != null && !value.isBlank()) ? value.trim() : fallback;
    }
}
