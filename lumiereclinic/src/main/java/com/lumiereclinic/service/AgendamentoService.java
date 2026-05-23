package com.lumiereclinic.service;

import com.lumiereclinic.dto.AgendamentoRequest;
import com.lumiereclinic.dto.DisponibilidadeResponse;
import com.lumiereclinic.dto.RemarcacaoRequest;
import com.lumiereclinic.enums.StatusAgendamento;
import com.lumiereclinic.exception.ResourceBadRequestException;
import com.lumiereclinic.exception.ResourceNotFoundException;
import com.lumiereclinic.model.Agendamento;
import com.lumiereclinic.model.Cliente;
import com.lumiereclinic.model.Empresa;
import com.lumiereclinic.model.Servico;
import com.lumiereclinic.repository.AgendamentoRepository;
import com.lumiereclinic.repository.ClienteRepository;
import com.lumiereclinic.repository.EmpresaRepository;
import com.lumiereclinic.repository.ServicoRepository;
import com.lumiereclinic.util.PhoneUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AgendamentoService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Transactional
    public Agendamento criarAgendamentoPublico(AgendamentoRequest request) {
        if (request.getDataHora().isBefore(LocalDateTime.now())) {
            throw new ResourceBadRequestException("Nao e possivel agendar no passado");
        }

        Servico servico = servicoRepository.findById(request.getServicoId())
                .orElseThrow(() -> new ResourceBadRequestException("Servico nao encontrado"));

        if (!Boolean.TRUE.equals(servico.getAtivo())) {
            throw new ResourceBadRequestException("Servico indisponivel para agendamento");
        }

        validarTelefone(request.getTelefone());
        Cliente cliente = clienteRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    Cliente novo = new Cliente();
                    novo.setNome(request.getNome());
                    novo.setEmail(request.getEmail());
                    novo.setTelefone(PhoneUtils.normalize(request.getTelefone()));
                    return clienteRepository.save(novo);
                });

        cliente.setNome(request.getNome());
        cliente.setTelefone(PhoneUtils.normalize(request.getTelefone()));
        clienteRepository.save(cliente);

        Agendamento agendamento = new Agendamento();
        agendamento.setCliente(cliente);
        agendamento.setServico(servico);
        agendamento.setDataHora(request.getDataHora());
        agendamento.setObservacao(request.getObservacao());

        try {
            Agendamento salvo = agendamentoRepository.save(agendamento);
            aplicarMensagemWhatsapp(salvo, "solicitacao");
            return salvo;
        } catch (DataIntegrityViolationException ex) {
            throw new ResourceBadRequestException("Horario ja ocupado para o servico selecionado");
        }
    }

    public List<Agendamento> listarAgendamentos(String status, LocalDate data, String busca) {
        StatusAgendamento statusFiltro = null;

        if (status != null && !status.isBlank()) {
            try {
                statusFiltro = StatusAgendamento.valueOf(status.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ex) {
                throw new ResourceBadRequestException("Status de agendamento invalido");
            }
        }

        String termo = busca == null || busca.isBlank() ? null : busca.trim();
        LocalDateTime inicio = data != null ? data.atStartOfDay() : null;
        LocalDateTime fim = data != null ? data.atTime(23, 59, 59) : null;
        return agendamentoRepository.buscarComFiltros(statusFiltro, inicio, fim, termo);
    }

    @Transactional
    public Agendamento criarAgendamentoAdmin(AgendamentoRequest request) {
        return criarAgendamentoPublico(request);
    }

    public Agendamento confirmarAgendamento(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento nao encontrado"));

        agendamento.setStatus(StatusAgendamento.CONFIRMADO);
        Agendamento salvo = agendamentoRepository.save(agendamento);
        aplicarMensagemWhatsapp(salvo, "confirmacao");
        return salvo;
    }

    @Transactional
    public Agendamento remarcarAgendamento(Long id, RemarcacaoRequest request) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento nao encontrado"));

        if (agendamento.getCliente() == null || agendamento.getServico() == null) {
            throw new ResourceBadRequestException("Agendamento incompleto para remarcacao");
        }

        if (request.getDataHora().isBefore(LocalDateTime.now())) {
            throw new ResourceBadRequestException("Nao e possivel remarcar para uma data passada");
        }

        if (request.getTelefone() != null && !request.getTelefone().isBlank()) {
            validarTelefone(request.getTelefone());
            agendamento.getCliente().setTelefone(PhoneUtils.normalize(request.getTelefone()));
            clienteRepository.save(agendamento.getCliente());
        }

        if (agendamentoRepository.existsByDataHoraAndServicoId(request.getDataHora(), agendamento.getServico().getId())
                && !request.getDataHora().equals(agendamento.getDataHora())) {
            throw new ResourceBadRequestException("Horario ja ocupado para o servico selecionado");
        }

        agendamento.setDataHora(request.getDataHora());
        agendamento.setStatus(StatusAgendamento.REMARCAR);

        if (request.getObservacao() != null && !request.getObservacao().isBlank()) {
            agendamento.setObservacao(request.getObservacao().trim());
        }

        try {
            Agendamento salvo = agendamentoRepository.save(agendamento);
            aplicarMensagemWhatsapp(salvo, "remarcacao");
            return salvo;
        } catch (DataIntegrityViolationException ex) {
            throw new ResourceBadRequestException("Horario ja ocupado para o servico selecionado");
        }
    }

    public Agendamento cancelarAgendamento(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento nao encontrado"));

        agendamento.setStatus(StatusAgendamento.CANCELADO);
        Agendamento salvo = agendamentoRepository.save(agendamento);
        aplicarMensagemWhatsapp(salvo, "cancelamento");
        return salvo;
    }

    public List<Agendamento> listarPorData(LocalDate data) {
        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.atTime(23, 59, 59);
        return agendamentoRepository.findByDataHoraBetween(inicio, fim);
    }

    public DisponibilidadeResponse listarHorariosOcupados(Long servicoId, LocalDate data) {
        Servico servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Servico nao encontrado"));

        if (!Boolean.TRUE.equals(servico.getAtivo())) {
            throw new ResourceBadRequestException("Servico indisponivel para consulta");
        }

        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.atTime(23, 59, 59);

        List<String> horariosOcupados = agendamentoRepository
                .findByServicoIdAndDataHoraBetween(servicoId, inicio, fim)
                .stream()
                .filter(agendamento -> agendamento.getStatus() != StatusAgendamento.CANCELADO)
                .map(agendamento -> agendamento.getDataHora().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm", Locale.ROOT)))
                .toList();

        return new DisponibilidadeResponse(
                servicoId,
                data.toString(),
                calcularHorariosDisponiveis(servico, data, horariosOcupados),
                horariosOcupados
        );
    }

    public List<DisponibilidadeResponse> listarAgendaDisponivel(Long servicoId, LocalDate inicio, int dias) {
        Servico servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Servico nao encontrado"));

        List<DisponibilidadeResponse> agenda = new ArrayList<>();
        LocalDate cursor = inicio;

        while (agenda.size() < dias) {
            DisponibilidadeResponse dia = listarHorariosOcupados(servicoId, cursor);
            if (!dia.getHorariosDisponiveis().isEmpty()) {
                agenda.add(dia);
            }
            cursor = cursor.plusDays(1);
        }

        return agenda;
    }

    private List<String> calcularHorariosDisponiveis(Servico servico, LocalDate data, List<String> horariosOcupados) {
        Empresa empresa = empresaRepository.findById(servico.getEmpresaId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa nao encontrada para o servico"));

        List<String> horarios = new ArrayList<>();
        LocalDateTime agora = LocalDateTime.now();
        int duracao = servico.getDuracaoMinutos() == null ? 60 : servico.getDuracaoMinutos();
        int passo = 30;

        if (data.getDayOfWeek().getValue() == 7) {
            return horarios;
        }

        adicionarJanela(horarios, data, empresa.getHorarioSemanaInicio(), empresa.getIntervaloInicio(), duracao, passo, horariosOcupados, agora);
        adicionarJanela(horarios, data, empresa.getIntervaloFim(), empresa.getHorarioSemanaFim(), duracao, passo, horariosOcupados, agora);

        if (data.getDayOfWeek().getValue() == 6) {
            horarios.clear();
            adicionarJanela(horarios, data, empresa.getHorarioSabadoInicio(), empresa.getHorarioSabadoFim(), duracao, passo, horariosOcupados, agora);
        }

        return horarios;
    }

    private void adicionarJanela(
            List<String> horarios,
            LocalDate data,
            String inicio,
            String fim,
            int duracao,
            int passo,
            List<String> horariosOcupados,
            LocalDateTime agora
    ) {
        LocalTime inicioJanela = LocalTime.parse(inicio);
        LocalTime fimJanela = LocalTime.parse(fim);

        for (LocalTime cursor = inicioJanela; !cursor.plusMinutes(duracao).isAfter(fimJanela); cursor = cursor.plusMinutes(passo)) {
            String valor = cursor.format(DateTimeFormatter.ofPattern("HH:mm", Locale.ROOT));
            LocalDateTime dataHora = LocalDateTime.of(data, cursor);

            if (dataHora.isBefore(agora) || horariosOcupados.contains(valor)) {
                continue;
            }

            horarios.add(valor);
        }
    }

    private void aplicarMensagemWhatsapp(Agendamento agendamento, String tipo) {
        String telefone = PhoneUtils.normalize(agendamento.getCliente().getTelefone());

        if (!PhoneUtils.isValid(telefone)) {
            return;
        }

        String mensagem = montarMensagem(agendamento, tipo);
        agendamento.setWhatsappMensagem(mensagem);
        agendamento.setWhatsappUrl("https://wa.me/55" + telefone + "?text=" + UriUtils.encode(mensagem, StandardCharsets.UTF_8));
    }

    private String montarMensagem(Agendamento agendamento, String tipo) {
        String dataHoraFormatada = agendamento.getDataHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'as' HH:mm", new Locale("pt", "BR")));
        String nome = agendamento.getCliente().getNome();
        String servico = agendamento.getServico().getNome();

        return switch (tipo) {
            case "confirmacao" -> "Ola, " + nome + ". Seu agendamento de " + servico + " na Lumiere Clinic foi confirmado para " + dataHoraFormatada + ".";
            case "remarcacao" -> "Ola, " + nome + ". Seu atendimento de " + servico + " foi remarcado para " + dataHoraFormatada + ".";
            case "cancelamento" -> "Ola, " + nome + ". Seu atendimento de " + servico + " na Lumiere Clinic foi cancelado. Se desejar, podemos ajudar com um novo horario.";
            default -> "Ola, " + nome + ". Recebemos sua solicitacao de " + servico + " para " + dataHoraFormatada + ".";
        };
    }

    private void validarTelefone(String telefone) {
        if (!PhoneUtils.isValid(telefone)) {
            throw new ResourceBadRequestException("Telefone invalido");
        }
    }
}
