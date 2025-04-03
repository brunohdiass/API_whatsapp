document.addEventListener('DOMContentLoaded', () => {
    const inputBuscar = document.getElementById('procurar');
    const botaoBuscar = document.getElementById('buscarContato');
    const listaContatos = document.getElementById('listaContatos');
    const nomeContato = document.getElementById('nomeContato');
    const fotoContato = document.getElementById('fotoContato');
    const mensagensContainer = document.getElementById('mensagens');

    botaoBuscar.addEventListener('click', async () => {
        const numero = inputBuscar.value.trim();
        if (!numero) return alert('Digite um número válido.');

        try {
            const response = await fetch(`https://giovanna-whatsapp.onrender.com/v1/whatsapp/contatos/${numero}`);
            if (!response.ok) throw new Error('Erro ao buscar contato');
            const data = await response.json();

            // Verifica se o formato da resposta está correto
            if (!data || !data.dados_contato || !Array.isArray(data.dados_contato)) {
                throw new Error('Resposta da API inválida.');
            }

            exibirContatos(data.dados_contato);
        } catch (error) {
            console.error(error);
            alert('Erro ao buscar contatos.');
        }
    });

    function exibirContatos(contatos) {
        listaContatos.innerHTML = '';

        if (contatos.length === 0) {
            listaContatos.innerHTML = '<p style="padding: 10px;">Nenhum contato encontrado.</p>';
            return;
        }

        contatos.forEach(contato => {
            const contatoDiv = document.createElement('div');
            contatoDiv.classList.add('contato');

            // Verifica se os dados existem antes de acessar
            const nome = contato.nome || 'Sem Nome';
            const numero = contato.numero || 'Número Desconhecido';
            const foto = contato.foto || './default.jpg';

            contatoDiv.dataset.nome = nome;
            contatoDiv.dataset.numero = numero;

            contatoDiv.innerHTML = `
                <div class="foto" style="background-image: url('${foto}');"></div>
                <div class="info">
                    <div class="nome">${nome}</div>
                </div>
            `;

            contatoDiv.addEventListener('click', () => carregarConversa(contato));
            listaContatos.appendChild(contatoDiv);
        });
    }

    async function carregarConversa(contato) {
        nomeContato.textContent = contato.nome || 'Sem Nome';
        fotoContato.style.backgroundImage = `url('${contato.foto || './default.jpg'}')`;
        mensagensContainer.innerHTML = '';

        try {
            const response = await fetch(`https://giovanna-whatsapp.onrender.com/v1/whatsapp/conversas?numero=${contato.numero}`);
            if (!response.ok) throw new Error('Erro ao carregar conversa');
            const data = await response.json();

            // Verifica se a API retornou mensagens corretamente
            if (!data || !data.mensagens || !Array.isArray(data.mensagens)) {
                throw new Error('Erro ao carregar mensagens.');
            }

            data.mensagens.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.classList.add('msg', msg.tipo === 'enviada' ? 'enviada' : 'recebida');
                msgDiv.textContent = msg.texto;
                mensagensContainer.appendChild(msgDiv);
            });
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar conversa.');
        }
    }
});
