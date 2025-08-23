function abrirModal(idModal) {
            const modal = document.getElementById(idModal);
            if (modal) modal.style.display = 'flex';
        }

        function fecharModal(idModal) {
            const modal = document.getElementById(idModal);
            if (modal) modal.style.display = 'none';
        }
        
    
        window.onload = function() {
            // Variáveis globais para a loja
            let carrinho = [];
            const numeroWhatsApp = '5585997834287'; // Altere este número para o da sua loja

            // Pegando os elementos da página para usá-los no script
            const modalCarrinho = document.getElementById('cart-modal');
            const modalCheckout = document.getElementById('checkout-modal');
            const itensCarrinho = document.getElementById('cart-items');
            const contadorCarrinho = document.getElementById('cart-count');
            const totalCarrinho = document.getElementById('cart-total');
            const mensagemCarrinhoVazio = document.getElementById('empty-cart-message');
            const botaoFinalizarCompra = document.getElementById('checkout-btn');
            const formularioCheckout = document.getElementById('checkout-form');
            const botaoAbrirCarrinho = document.getElementById('open-cart-btn');
            const botoesAdicionar = document.querySelectorAll('.add-to-cart-btn');
            const nomeClienteInput = document.getElementById('customer-name');
            const telefoneClienteInput = document.getElementById('customer-phone');
            const pixQrCode = document.getElementById('pix-qr-code');
            const pixQrCodeImg = document.getElementById('pix-qr-code-img');

            // Função para atualizar a visualização do carrinho
            function atualizarCarrinho() {
                itensCarrinho.innerHTML = '';
                let valorTotal = 0;

                if (carrinho.length === 0) {
                    mensagemCarrinhoVazio.style.display = 'block';
                    botaoFinalizarCompra.disabled = true;
                } else {
                    mensagemCarrinhoVazio.style.display = 'none';
                    botaoFinalizarCompra.disabled = false;
                    carrinho.forEach(item => {
                        const elementoItem = document.createElement('div');
                        elementoItem.classList.add('flex', 'justify-between', 'items-center', 'mb-2');
                        elementoItem.innerHTML = `
                            <p class="text-lg">${item.nome} x${item.quantidade}</p>
                            <p class="font-bold">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</p>
                        `;
                        itensCarrinho.appendChild(elementoItem);
                        valorTotal += item.preco * item.quantidade;
                    });
                }

                contadorCarrinho.textContent = carrinho.length;
                totalCarrinho.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
            }

            // Adiciona um evento de clique para o botão "Adicionar ao Carrinho"
            botoesAdicionar.forEach(botao => {
                botao.addEventListener('click', (e) => {
                    const idProduto = botao.dataset.id;
                    const nomeProduto = botao.dataset.name;
                    const precoProduto = parseFloat(botao.dataset.price);
                    
                    const cardProduto = botao.closest('.product-card');
                    const inputQuantidade = cardProduto.querySelector('input[name="quantity"]');
                    const quantidade = parseInt(inputQuantidade.value, 10);

                    if (isNaN(quantidade) || quantidade < 1) {
                        console.error('Por favor, insira uma quantidade válida.');
                        return;
                    }

                    const itemExistente = carrinho.find(item => item.id === idProduto);

                    if (itemExistente) {
                        itemExistente.quantidade += quantidade;
                    } else {
                        carrinho.push({ id: idProduto, nome: nomeProduto, preco: precoProduto, quantidade: quantidade });
                    }

                    atualizarCarrinho();
                    abrirModal('cart-modal'); 
                });
            });
            
            // Adiciona um evento de clique para abrir o carrinho
            botaoAbrirCarrinho.addEventListener('click', () => {
                atualizarCarrinho(); 
                abrirModal('cart-modal'); 
            });

            // Adiciona um evento de clique para ir para o checkout
            botaoFinalizarCompra.addEventListener('click', () => {
                fecharModal('cart-modal');
                abrirModal('checkout-modal');
            });

            // Lógica para mostrar/esconder campos no checkout
            const detalhesEntrega = document.getElementById('delivery-details');
            const detalhesCartao = document.getElementById('card-details');

            // Evento para a opção de Entrega/Retirada
            document.querySelectorAll('input[name="delivery-option"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.value === 'entrega') {
                        if (detalhesEntrega) {
                            detalhesEntrega.classList.remove('hidden');
                            detalhesEntrega.querySelector('input').required = true;
                        }
                    } else {
                        if (detalhesEntrega) {
                            detalhesEntrega.classList.add('hidden');
                            detalhesEntrega.querySelector('input').required = false;
                        }
                    }
                });
            });

            // Evento para a opção de Pagamento
            document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (detalhesCartao) detalhesCartao.classList.add('hidden');
                    if (pixQrCode) pixQrCode.classList.add('hidden');
                    
                    if (e.target.value === 'cartao') {
                        if (detalhesCartao) detalhesCartao.classList.remove('hidden');
                    } else if (e.target.value === 'pix') {
                        if (pixQrCode) pixQrCode.classList.remove('hidden');

                        const valorTotal = carrinho.reduce((soma, item) => soma + (item.preco * item.quantidade), 0);
                        const nomeCliente = nomeClienteInput.value || 'Cliente';
                        const telefoneCliente = telefoneClienteInput.value || 'Não informado';

                        const pixPayload = `PIX INFO: Valor R$${valorTotal.toFixed(2).replace('.', ',')}, Cliente: ${nomeCliente}, Telefone: ${telefoneCliente}`;
                        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixPayload)}`;
                        
                        pixQrCodeImg.src = qrCodeUrl;
                    }
                });
            });
            
            // Função que cria a mensagem para o WhatsApp
            function criarMensagemWhatsApp() {
                const nomeCliente = nomeClienteInput.value;
                const telefoneCliente = telefoneClienteInput.value;
                const opcaoEntrega = document.querySelector('input[name="delivery-option"]:checked').value;
                const metodoPagamento = document.querySelector('input[name="payment-method"]:checked').value;
                const valorTotal = carrinho.reduce((soma, item) => soma + (item.preco * item.quantidade), 0);
                
                let mensagem = `Olá! Gostaria de confirmar meu pedido:\n\n`;
                mensagem += `*Nome do Cliente:* ${nomeCliente}\n`;
                mensagem += `*Telefone:* ${telefoneCliente}\n\n`;
                
                mensagem += `*Itens do Pedido:*\n`;
                carrinho.forEach(item => {
                    mensagem += `- ${item.nome} x${item.quantidade} (R$ ${item.preco.toFixed(2).replace('.', ',')})\n`;
                });
                
                mensagem += `\n*Total do Pedido:* R$ ${valorTotal.toFixed(2).replace('.', ',')}\n\n`;
                
                mensagem += `*Forma de Recebimento:* ${opcaoEntrega === 'entrega' ? 'Entrega' : 'Retirada na Loja'}\n`;
                if (opcaoEntrega === 'entrega') {
                    const enderecoEntrega = document.getElementById('delivery-address').value;
                    const complementoEntrega = document.getElementById('delivery-complement').value;
                    mensagem += `*Endereço de Entrega:* ${enderecoEntrega}\n`;
                    if (complementoEntrega) {
                        mensagem += `*Complemento:* ${complementoEntrega}\n`;
                    }
                }
                
                mensagem += `\n*Forma de Pagamento:* ${metodoPagamento === 'cartao' ? 'Cartão de Crédito/Débito' : 'Pix'}\n`;
                
                return encodeURIComponent(mensagem);
            }

            // Evento para enviar o formulário e abrir o WhatsApp
            formularioCheckout.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (carrinho.length === 0) {
                    console.error('Seu carrinho está vazio.');
                    return;
                }

                const mensagemWhatsApp = criarMensagemWhatsApp();
                const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensagemWhatsApp}`;
                
                window.open(urlWhatsApp, '_blank');
                
                fecharModal('checkout-modal');

                carrinho = [];
                atualizarCarrinho();
            });
            
            // Inicializa a loja
            atualizarCarrinho();
        };  
