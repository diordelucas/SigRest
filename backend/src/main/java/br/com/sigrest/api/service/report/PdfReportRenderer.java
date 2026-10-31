package br.com.sigrest.api.service.report;

import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.exception.ErrorCode;
import br.com.sigrest.api.service.audit.LogAtividadeService;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Gera os relatórios em PDF em duas etapas: o Thymeleaf monta o HTML a partir do template em
 * {@code templates/reports/} e o OpenHTMLtoPDF converte esse HTML (com CSS de página A4,
 * cabeçalho e rodapé repetidos) em PDF.
 *
 * <p>Os templates precisam ser XHTML bem formado (tags fechadas, sem entidades como
 * {@code &nbsp;}), porque o OpenHTMLtoPDF lê o HTML com um parser XML.
 */
@Component
public class PdfReportRenderer {

    private static final Logger log = LoggerFactory.getLogger(PdfReportRenderer.class);

    private final ITemplateEngine templateEngine;
    private final LogAtividadeService logAtividadeService;
    private final ReportFormatter formatter = new ReportFormatter();

    @Value("${app.report.company-name:SIGREST Gestão}")
    private String companyName;

    public PdfReportRenderer(ITemplateEngine templateEngine, LogAtividadeService logAtividadeService) {
        this.templateEngine = templateEngine;
        this.logAtividadeService = logAtividadeService;
    }

    public byte[] render(String template, String titulo, String periodo, Map<String, Object> dados) {
        return toPdf(renderHtml(template, titulo, periodo, dados), template);
    }

    /** HTML intermediário — exposto separado para os testes conferirem o conteúdo sem abrir o PDF. */
    public String renderHtml(String template, String titulo, String periodo, Map<String, Object> dados) {
        Context context = new Context(ReportFormatter.PT_BR);
        context.setVariables(dados);
        context.setVariable("titulo", titulo);
        context.setVariable("periodo", periodo);
        context.setVariable("empresa", companyName);
        context.setVariable("geradoEm", formatter.dataHora(LocalDateTime.now()));
        context.setVariable("geradoPor", nomeDoUsuarioAtual());
        context.setVariable("fmt", formatter);
        return templateEngine.process("reports/" + template, context);
    }

    private byte[] toPdf(String html, String template) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Falha ao converter o relatório '{}' para PDF", template, e);
            throw new BusinessException(ErrorCode.REPORT_GERACAO_FALHOU);
        }
    }

    private String nomeDoUsuarioAtual() {
        User usuario = logAtividadeService.usuarioAtual();
        if (usuario == null) {
            return null;
        }
        return usuario.getName() != null && !usuario.getName().isBlank() ? usuario.getName() : usuario.getEmail();
    }
}
