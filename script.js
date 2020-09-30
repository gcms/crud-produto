// Model
var PRODUTOS = [];
var PRODUTO_SELECIONADO;

function insiraProduto(produto) {
  if (!obtenhaProdutoPorCodigo(produto.codigo)) {
    PRODUTOS.push(produto);
    return produto;
  }
    
  return false;
}

function obtenhaListaProdutos() {
  return PRODUTOS;
}

function obtenhaProdutoPorCodigo(codigo) {
  let produto = null;
  for (let i = 0; i < PRODUTOS.length; i++) {
    if (PRODUTOS[i].codigo == codigo) {
      produto = PRODUTOS[i];
      break;
    }
  }

  return produto;
}

function removaProdutoPorCodigo(codigo) {
  PRODUTOS = PRODUTOS.filter(function (it) { return it.codigo != codigo });
}

function selecioneProduto(codigo) {
  PRODUTO_SELECIONADO = obtenhaProdutoPorCodigo(codigo);
  exibaDadosProduto(PRODUTO_SELECIONADO);
}

function excluaProdutoSelecionado(codigo) {
  PRODUTOS = PRODUTOS.filter(it => it != PRODUTO_SELECIONADO);
}


function obtenhaProdutoSelecionado() {
  return PRODUTO_SELECIONADO;
}


// View
function exiba(id) {
  const conteudo = document.getElementById("conteudo");

  for (let i = 0; i < conteudo.children.length; i++) {
    let child = conteudo.children[i];
    if (child.id != id) {
      conteudo.children[i].setAttribute("class", "invisible");
    } else {
      conteudo.children[i].setAttribute("class", "");
    }
  }
}


function exibaListagem() {
  const table = document.querySelector("#listar table");
  table.innerHTML = "";

  let produtos = obtenhaListaProdutos();

  for (let i = 0; i < produtos.length; i++) {
    let produto = produtos[i];

    let tr = document.createElement("tr");
    tr.setAttribute('onclick', "mostreProduto('" + produto.codigo + "')");
    table.appendChild(tr);

    let codigo = document.createElement("td");
    codigo.innerHTML = produto.codigo;
    tr.appendChild(codigo);

    let nome = document.createElement("td");
    nome.innerHTML = produto.nome;
    tr.appendChild(nome);
  }

  exiba("listar");
}

function limpeFormulario() {
  document.querySelectorAll('#editar input').forEach(it => it.value = '');
}


function exibaCadastroProduto() {
  limpeFormulario();
  exiba("editar");
}

function exibaDadosProduto(produto) {
  if (produto) {
    document.getElementById('codigo').innerHTML = produto.codigo;
    document.getElementById('nome').innerHTML = produto.nome;
    document.getElementById('descricao').innerHTML = produto.descricao;
    document.getElementById('preco').innerHTML = produto.preco;
    exiba("exibir");
  } else {
    alert("Produto invalido");
  }
}

function obtenhaProdutoFormulario() {
  const formData = new FormData(document.querySelector("form"));

  const produto = {};
  for (let pair of formData.entries()) {
    produto[pair[0]] = pair[1];
  }

  return produto;
}

window.onload = function () {
  exibaListagem();

  document.querySelectorAll('form input').forEach(it => {
    it.onkeypress = function(e) {
      if(e.which == 10 || e.which == 13) {
        cadastreProduto();
      }
    }
  });
};


// Controller
function cadastreProduto() {
  const produto = obtenhaProdutoFormulario();

  if (!produto.codigo || !produto.nome || !produto.preco) {
    alert("Dados não fornecidos!");
  } else if (!insiraProduto(produto)) {
    alert("Não foi possível inserir!");
  } else {
    exibaListagem();
  }
}

function excluaProduto() {
  excluaProdutoSelecionado()
  exibaListagem();
}

function mostreProduto(codigo) {
  selecioneProduto(codigo);
}