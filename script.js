
// IndexedDB
// Na linha abaixo, você deve incluir os prefixos do navegador que você vai testar.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// Não use "var indexedDB = ..." se você não está numa function.
// Posteriormente, você pode precisar de referências de algum objeto window.IDB*:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla nunca usou prefixo nesses objetos, então não precisamos window.mozIDB*)


function withStore(success, error) {
  var request = window.indexedDB.open("produto", 3);
  request.onerror = function (event) {
    return error('Database error: ' + event.target.errorCode);
  };
  request.onupgradeneeded = function (event) {
    let db = event.target.result;
    return db.createObjectStore("produtos", { keyPath: "codigo" });
    // return cb(store);
  }
  request.onsuccess = function (event) {
    let db = event.target.result;
    let tx = db.transaction('produtos', 'readwrite');
    return success(tx.objectStore('produtos'));
  }
}


// Model
var PRODUTO_SELECIONADO;

function insiraProduto(produto, success, error) {
  return withStore(function (store) {
    let request = store.add(produto);
    request.onsuccess = () => success(produto);
    request.onerror = () => error('Database error: ' + event.target.errorCode);
    return request;
  });
}

function obtenhaListaProdutos(success) {
  return withStore(function (store) {
    let request = store.getAll();
    request.onsuccess = (event) => success(event.target.result);
    request.onerror = (event) => error('Database error: ' + event.target.errorCode);
    return request;
  });
}

function obtenhaProdutoPorCodigo(codigo, success, error) {
  return withStore(function (store) {
    let request = store.get(codigo);
    request.onsuccess = (event) => success(event.target.result);
    request.onerror = (event) => error('Database error: ' + event.target.errorCode);
    return request;
  });
}

function selecioneProduto(codigo) {
  obtenhaProdutoPorCodigo(codigo,
    (produto) => {
      PRODUTO_SELECIONADO = produto;
      exibaDadosProduto(produto)
    });
}

function excluaProdutoSelecionado(success, error) {
  return withStore(function (store) {
    let request = store.delete(PRODUTO_SELECIONADO.codigo);
    request.onsuccess = (event) => success(event.target.result);
    request.onerror = (event) => error('Database error: ' + event.target.errorCode);
    return request;
  });
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

function atualizeListaProdutos(produtos) {
  const table = document.querySelector("#listar table");
  table.innerHTML = "";

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
}

function exibaListagem() {
  obtenhaListaProdutos((produtos) => atualizeListaProdutos(produtos));

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
    it.onkeypress = function (e) {
      if (e.which == 10 || e.which == 13) {
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
  } else {
    insiraProduto(produto,
      () => exibaListagem(),
      () => alert("Não foi possível inserir!"));
  }
}

function excluaProduto() {
  excluaProdutoSelecionado(
    () => exibaListagem());
}

function mostreProduto(codigo) {
  selecioneProduto(codigo);
}