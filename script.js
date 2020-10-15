// Model
class ProdutoModel {
  observers = [];
  selecionado = null;

  constructor(url) {
    this.baseUrl = url;
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  obtenhaListaProdutos() {
    return fetch(this.baseUrl).then(response => response.json());
  }

  insiraProduto(produto) {
    return fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produto)
    }).then(response => response.json());
  }

  atualizeProduto(produto) {
    return fetch(`${this.baseUrl}/${produto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produto)
    }).then(response => response.json());
  }

  excluaProdutoSelecionado() {
    return fetch(`${this.baseUrl}/${this.selecionado.id}`,
      { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, })
      .then(response => response.json());
  }

  obtenhaProdutoPorCodigo(codigo) {
    return fetch(`${this.baseUrl}/${codigo}`)
      .then(response => response.json());
  }

  selecioneProduto(codigo) {
    this.obtenhaProdutoPorCodigo(codigo)
      .then(produto => this.notifyProdutoSelecionado(produto))
      .catch(err => this.notifyError(err));
  }

  notifyProdutoSelecionado(produto) {
    this.selecionado = produto;
    this.observers.forEach(it => it.onProdutoSelecionado(produto));
  }

  notifyError(err) {
    this.observers.forEach(it => it.onError(err.message));
  }

  obtenhaProdutoSelecionado() {
    return Promise.resolve(this.selecionado);
  }
}


class ProdutoView {
  constructor(model) {
    this.model = model;

    document.querySelector('#novo')
      .addEventListener('click', () => this.exibaCadastroProduto());

    document.querySelector('#create-cancel')
      .addEventListener('click', () => this.exibaListagem());

    document.querySelector('#view-back')
      .addEventListener('click', () => this.exibaListagem());

    document.querySelector('#view-edit')
      .addEventListener('click', () => this.exibaAlterarProduto());
  }

  inicialize() {
    this.exibaListagem();
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
      const child = conteudo.children[i];
      if (child.id != id) {
        child.setAttribute("class", "invisible");
      } else {
        child.setAttribute("class", "");
      }
    }
  }

  atualizeListaProdutos(produtos) {
    const parent = document.querySelector("#listar-conteudo");

    while (parent.children.length > 1) {
      parent.children[1].remove();
    }

    for (let i = 0; i < produtos.length; i++) {
      const produto = produtos[i];

      const el = this.crieElemento(parent, produto);
      el.addEventListener('click',
        () => this.selecioneProduto(produto.id));
    }
  }

  crieElemento(table, produto) {
    let item = document.createElement("li");
    table.appendChild(item);

    let codigo = document.createElement("span");
    codigo.innerHTML = produto.id;
    item.appendChild(codigo);

    let nome = document.createElement("span");
    nome.innerHTML = produto.nome;
    item.appendChild(nome);
    return item;
  }

  exibaListagem() {
    this.model.obtenhaListaProdutos()
      .then((produtos) => this.atualizeListaProdutos(produtos))
      .catch(err => this.alert(err.message));

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

    this.model.obtenhaProdutoSelecionado()
      .then(produto => {
        this.carregueFormulario(produto);
        this.exiba("editar");
      });
  }

  exibaDadosProduto(produto) {
    for (let k in produto) {
      document.getElementById(k).innerHTML = '' + produto[k];
    }
    this.exiba("exibir");
  }

  onProdutoSelecionado(produto) {
    if (produto) {
      this.exibaDadosProduto(produto);
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

  onSelectProduto(cb) {
    this.selecioneProduto = cb;
  }
}

class ProdutoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    view.onSelectProduto((id) => model.selecioneProduto(id));
    view.onDeleteProduto(() => this.excluaProdutoSelecionado());
    view.onSubmitProduto((produto) => this.cadastreProduto(produto))
    view.onChangeProduto((produto) => this.altereProdutoSelecionado(produto));
  }

  cadastreProduto(produto) {
    if (!produto.nome || !produto.preco) {
      this.view.alert("Dados não fornecidos!");
    } else {
      this.model.insiraProduto(produto)
        .then(() => this.view.exibaListagem())
        .catch(err => this.view.alert("Não foi possível inserir!", err.message));
    }
  }

  excluaProdutoSelecionado() {
    this.model.excluaProdutoSelecionado()
      .then(() => this.view.exibaListagem())
      .catch(err => this.view.alert("Não foi possível excluir!", err));
  }

  altereProdutoSelecionado(produto) {
    this.model.atualizeProduto(produto)
      .then(() => this.view.exibaListagem())
      .catch(err => this.view.alert("Não foi possível inserir!", err));
  }

}

class ProdutoApp {
  constructor() {
    this.model = new ProdutoModel("http://localhost:3000/produtos");
    this.view = new ProdutoView(this.model);
    this.controller = new ProdutoController(this.model, this.view);
    this.model.addObserver(this.view);
  }

  inicialize() {
    this.view.inicialize();
  }
}

window.onload = function () {
  new ProdutoApp().inicialize();
};

