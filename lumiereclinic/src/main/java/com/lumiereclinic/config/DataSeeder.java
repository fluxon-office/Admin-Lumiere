package com.lumiereclinic.config;

import com.lumiereclinic.model.Servico;
import com.lumiereclinic.model.Usuario;
import com.lumiereclinic.repository.ServicoRepository;
import com.lumiereclinic.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEFAULT_ADMIN_EMAIL = "fluxon@gmail.com";

    @Bean
    CommandLineRunner seedInitialData(
            ServicoRepository servicoRepository,
            UsuarioRepository usuarioRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        return args -> {
            seedAdminUser(usuarioRepository, passwordEncoder);
            seedServices(servicoRepository);
        };
    }

    private void seedAdminUser(UsuarioRepository usuarioRepository, BCryptPasswordEncoder passwordEncoder) {
        List<Usuario> usuarios = usuarioRepository.findAllByEmail(DEFAULT_ADMIN_EMAIL);
        Usuario usuario = usuarios.stream().findFirst().orElseGet(Usuario::new);

        if (usuarios.size() > 1) {
            log.warn("Foram encontrados {} usuarios com o e-mail {}. O seed vai reutilizar apenas o primeiro registro.", usuarios.size(), DEFAULT_ADMIN_EMAIL);
        }

        usuario.setNome("Fluxon Admin");
        usuario.setEmail(DEFAULT_ADMIN_EMAIL);
        usuario.setSenha(passwordEncoder.encode("123"));
        usuario.setTelefone("00000000000");

        usuarioRepository.save(usuario);
    }

    private void seedServices(ServicoRepository servicoRepository) {
        List<ServicoSeed> services = List.of(
                new ServicoSeed("Limpeza de pele", "Higienizacao profunda e renovacao da textura para uma pele mais luminosa e uniforme.", "Facial", 180.0, 60),
                new ServicoSeed("Peeling", "Protocolo para refinamento da superficie da pele com foco em brilho, clareza e renovacao.", "Facial", 260.0, 40),
                new ServicoSeed("Microagulhamento", "Estimulo controlado para favorecer regeneracao, textura e qualidade cutanea.", "Facial", 420.0, 70),
                new ServicoSeed("Massagem relaxante", "Experiencia de bem-estar com ritmo acolhedor e sensacao imediata de alivio corporal.", "Bem-estar", 160.0, 60),
                new ServicoSeed("Drenagem linf\u00e1tica", "Manobras especializadas para desinchar, aliviar retencao e favorecer leveza corporal.", "Corporal", 160.0, 50),
                new ServicoSeed("Preenchimento labial", "Definicao sutil de contorno, hidratacao e harmonia labial com acabamento refinado.", "Labial", 850.0, 50),
                new ServicoSeed("Bioestimulador", "Tratamento voltado ao estimulo de colageno para firmeza progressiva e aspecto sofisticado.", "Facial", 900.0, 60),
                new ServicoSeed("Botox", "Suavizacao de linhas de expressao com planejamento estetico e naturalidade.", "Facial", 690.0, 45),
                new ServicoSeed("Secagem de vasinhos", "Cuidado direcionado para melhorar o aspecto visual dos vasinhos com atencao tecnica.", "Corporal", 350.0, 45),
                new ServicoSeed("Micro labial", "Realce delicado de cor e definicao para labios com aparencia mais uniforme.", "Labial", 650.0, 60),
                new ServicoSeed("Tratamento para gordura localizada", "Protocolos focados em contorno corporal com leitura estetica e acompanhamento serio.", "Corporal", 390.0, 60),
                new ServicoSeed("Enzimas para gordura localizada", "Abordagem complementar para areas especificas com estrategia de tratamento mais precisa.", "Corporal", 320.0, 45)
        );

        services.forEach(seed -> {
            List<Servico> servicosExistentes = servicoRepository.findAllByNomeIgnoreCase(seed.nome());
            Servico servico = servicosExistentes.stream().findFirst().orElseGet(Servico::new);

            if (servicosExistentes.size() > 1) {
                log.warn("Foram encontrados {} servicos com o nome '{}'. O seed vai atualizar apenas o primeiro registro.", servicosExistentes.size(), seed.nome());
            }

            servico.setNome(seed.nome());
            servico.setDescricao(seed.descricao());
            servico.setCategoria(seed.categoria());
            servico.setPreco(seed.preco());
            servico.setDuracaoMinutos(seed.duracaoMinutos());
            servico.setAtivo(true);
            servico.setPublicado(true);

            servicoRepository.save(servico);
        });
    }

    private record ServicoSeed(
            String nome,
            String descricao,
            String categoria,
            Double preco,
            Integer duracaoMinutos
    ) {
    }
}
