const BASE_URL = "http://localhost:3000/produtos";


// Model
class ProdutoModel {
  observers = [];
  selecionado = null;

  addObserver(observer) {
    this.observers.push(observer);
  }

  obtenhaListaProdutos(success, error) {
    return fetch(BASE_URL)
      .then(response => response.json())
      .then(products => success(products))
      .catch(err => error(err.message));
  }

  obtenhaProdutoPorCodigo(codigo, success, error) {
    return fetch(BASE_URL + "/" + codigo)
      .then(response => response.json())
      .then(product => success(product))
      .catch(err => error ? error(err.message) : undefined);
  }

  insiraProduto(produto, success, error) {
    return fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produto)
    })
      .then(response => response.json())
      .then(product => success(product))
      .catch(err => error(err.message));
  }

  atualizeProduto(produto, success, error) {
    return fetch(BASE_URL + "/" + produto.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produto)
    })
      .then(response => response.json())
      .then(product => success(product))
      .catch(err => error(err.message));
  }

  selecioneProduto(codigo) {
    this.obtenhaProdutoPorCodigo(codigo,
      (produto) => {
        this.selecionado = produto;
        this.observers.forEach(it => it.onProdutoSelecionado(produto));
      });
  }

  excluaProdutoSelecionado(success, error) {
    return fetch(BASE_URL + "/" + this.selecionado.id, { method: 'DELETE' })
      .then(response => response.json()).then(success).catch(err => error ? error(err.message) : undefined);
  }

  obtenhaProdutoSelecionado(success, error) {
    return success(this.selecionado);
  }
}


class ProdutoView {
  constructor(model, window, document) {
    this.model = model;
    this.window = window;
    this.document = document;

    document.querySelector('#novo')
      .addEventListener('click', () => this.exibaCadastroProduto());

    document.querySelector('#create-cancel')
      .addEventListener('click', () => this.exibaListagem());

    document.querySelector('#view-back')
      .addEventListener('click', () => this.exibaListagem());

    document.querySelector('#view-edit')
      .addEventListener('click', () => this.exibaAlterarProduto());
  }

  alert(msg, err) {
    if (err) {
      msg += `\n${err}`;
    }

    alert(msg);
  }

  exiba(id) {
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

  atualizeListaProdutos(produtos) {
    const table = document.querySelector("#listar table");
    table.innerHTML = "";

    for (let i = 0; i < produtos.length; i++) {
      let produto = produtos[i];

      let tr = document.createElement("tr");
      table.appendChild(tr);

      let codigo = document.createElement("td");
      codigo.innerHTML = produto.id;
      tr.appendChild(codigo);

      let nome = document.createElement("td");
      nome.innerHTML = produto.nome;
      tr.appendChild(nome);

      tr.addEventListener('click',
        () => this.model.selecioneProduto(produto.id));
    }
  }

  exibaListagem() {
    this.model.obtenhaListaProdutos((produtos) => this.atualizeListaProdutos(produtos));

    this.exiba("listar");
  }

  limpeFormulario() {
    document.querySelectorAll('#editar input, #editar textarea').forEach(it => it.value = '');
  }

  carregueFormulario(produto) {
    const formData = new FormData(document.querySelector("form"));
    for (let k in produto) {
      document.getElementsByName(k)[0].value = produto[k];
    }
  }


  exibaCadastroProduto() {
    this.estaCadastrando = true;
    this.limpeFormulario();
    this.exiba("editar");
  }

  exibaAlterarProduto() {
    this.estaCadastrando = false;
    this.model.obtenhaProdutoSelecionado((produto) => {
      this.carregueFormulario(produto);
      this.exiba("editar");
    });
  }

  onProdutoSelecionado(produto) {
    if (produto) {
      document.getElementById('codigo').innerHTML = produto.id;
      document.getElementById('nome').innerHTML = produto.nome;
      document.getElementById('descricao').innerHTML = produto.descricao;
      document.getElementById('preco').innerHTML = produto.preco;
      this.exiba("exibir");
    } else {
      this.view.alert("Produto invalido");
    }
  }

  obtenhaProdutoFormulario() {
    const formData = new FormData(document.querySelector("form"));

    const produto = {};
    for (let pair of formData.entries()) {
      produto[pair[0]] = pair[1];
    }

    return produto;
  }

  onSubmit(cb) {
    document.querySelector('#create-submit')
      .addEventListener('click', () => {
        cb();
      });


    document.querySelectorAll('form input').forEach(it => {
      it.addEventListener('keypress', (ev) => {
        if (ev.which == 10 || ev.which == 13) {
          cb();
        }
      });
    });
  }

  onSubmitProduto(cb) {
    this.onSubmit(() => this.estaCadastrando && cb(this.obtenhaProdutoFormulario()));
  }

  onChangeProduto(cb) {
    this.onSubmit(() => !this.estaCadastrando && cb(this.obtenhaProdutoFormulario()));
  }

  onDeleteProduto(cb) {
    document.querySelector('#view-delete')
      .addEventListener('click', cb);
  }
}

class ProdutoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  cadastreProduto(produto) {
    if (!produto.nome || !produto.preco) {
      this.view.alert("Dados não fornecidos!");
    } else {
      this.model.insiraProduto(produto,
        () => this.view.exibaListagem(),
        (err) => this.view.alert("Não foi possível inserir!", err));
    }
  }

  excluaProdutoSelecionado() {
    this.model.excluaProdutoSelecionado(
      () => this.view.exibaListagem(),
      (err) => this.view.alert("Não foi possível excluir!", err));
  }

  altereProdutoSelecionado(produto) {
    this.model.atualizeProduto(produto,
      () => this.view.exibaListagem(),
      (err) => this.view.alert("Não foi possível inserir!", err));
  }

  mostreProduto(codigo) {
    model.selecioneProduto(codigo);
  }
}


window.onload = function () {
  let model = new ProdutoModel();

  let view = new ProdutoView(model, window, document);
  model.addObserver(view);

  let controller = new ProdutoController(model, view);

  view.onDeleteProduto(() => controller.excluaProdutoSelecionado());
  view.onSubmitProduto((produto) => controller.cadastreProduto(produto))
  view.onChangeProduto((produto) => controller.altereProdutoSelecionado(produto));

  view.exibaListagem();
};