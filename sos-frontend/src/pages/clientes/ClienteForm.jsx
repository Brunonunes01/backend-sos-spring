import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import {
  buscarClientePorId,
  criarCliente,
  atualizarCliente
} from '../../services/clienteService'

const REGEX_NOME = /^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .,'-]{3,150}$/
const REGEX_ENDERECO = /^(?=.*[A-Za-zÀ-ÿ0-9])[A-Za-zÀ-ÿ0-9 .,'\-/º°]{3,255}$/
const REGEX_CIDADE = /^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ .'-]{2,100}$/
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/

function manterDigitos(valor, limite) {
  return (valor || '').replace(/\D/g, '').slice(0, limite)
}

function ClienteForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const editando = !!id

  const [form, setForm] = useState({
    nome: '',
    cpfCnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    uf: '',
    cep: ''
  })

  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarCliente() {
      if (!editando) return

      try {
        const cliente = await buscarClientePorId(id)

        if (!cliente) {
          alert('Cliente não encontrado.')
          navigate('/clientes')
          return
        }

        setForm({
          nome: cliente.nome || '',
          cpfCnpj: manterDigitos(cliente.cpfCnpj, 14),
          email: cliente.email || '',
          telefone: manterDigitos(cliente.telefone, 11),
          endereco: cliente.endereco || '',
          cidade: cliente.cidade || '',
          uf: (cliente.uf || '').toUpperCase(),
          cep: manterDigitos(cliente.cep, 8)
        })
      } catch (error) {
        alert(error.message)
      }
    }

    carregarCliente()
  }, [editando, id, navigate])

  function handleChange(e) {
    const { name, value } = e.target

    if (name === 'cpfCnpj') {
      setForm((prev) => ({ ...prev, cpfCnpj: manterDigitos(value, 14) }))
      return
    }

    if (name === 'telefone') {
      setForm((prev) => ({ ...prev, telefone: manterDigitos(value, 11) }))
      return
    }

    if (name === 'cep') {
      setForm((prev) => ({ ...prev, cep: manterDigitos(value, 8) }))
      return
    }

    if (name === 'uf') {
      setForm((prev) => ({
        ...prev,
        uf: (value || '')
          .replace(/[^A-Za-z]/g, '')
          .slice(0, 2)
          .toUpperCase()
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  function validarFormulario() {
    const nome = form.nome.trim()
    const cpfCnpj = manterDigitos(form.cpfCnpj, 14)
    const email = form.email.trim().toLowerCase()
    const telefone = manterDigitos(form.telefone, 11)
    const endereco = form.endereco.trim()
    const cidade = form.cidade.trim()
    const uf = form.uf.trim().toUpperCase()
    const cep = manterDigitos(form.cep, 8)

    if (!nome || !cpfCnpj || !email || !telefone || !endereco || !cidade || !uf || !cep) {
      return 'Preencha todos os campos obrigatórios.'
    }

    if (!REGEX_NOME.test(nome)) {
      return 'Nome inválido. Evite caracteres especiais e use ao menos 3 caracteres.'
    }

    if (!(cpfCnpj.length === 11 || cpfCnpj.length === 14)) {
      return 'CPF/CNPJ deve conter 11 ou 14 dígitos.'
    }

    if (!REGEX_EMAIL.test(email)) {
      return 'E-mail inválido. Use um domínio completo, ex.: nome@empresa.com.'
    }

    if (!(telefone.length === 10 || telefone.length === 11)) {
      return 'Telefone deve conter 10 ou 11 dígitos.'
    }

    if (!REGEX_ENDERECO.test(endereco)) {
      return 'Endereço inválido. Evite caracteres especiais como #, $, @ e *.'
    }

    if (!REGEX_CIDADE.test(cidade)) {
      return 'Cidade inválida. Use apenas letras e espaços.'
    }

    if (!/^[A-Z]{2}$/.test(uf)) {
      return 'UF deve conter 2 letras.'
    }

    if (cep.length !== 8) {
      return 'CEP deve conter 8 dígitos.'
    }

    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    const mensagemErro = validarFormulario()
    if (mensagemErro) {
      setErro(mensagemErro)
      return
    }

    const payload = {
      nome: form.nome.trim(),
      cpfCnpj: manterDigitos(form.cpfCnpj, 14),
      email: form.email.trim().toLowerCase(),
      telefone: manterDigitos(form.telefone, 11),
      endereco: form.endereco.trim(),
      cidade: form.cidade.trim(),
      uf: form.uf.trim().toUpperCase(),
      cep: manterDigitos(form.cep, 8)
    }

    try {
      if (editando) {
        await atualizarCliente(id, payload)
        alert('Cliente atualizado com sucesso.')
      } else {
        await criarCliente(payload)
        alert('Cliente cadastrado com sucesso.')
      }

      navigate('/clientes')
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Clientes"
        title={editando ? 'Editar Cliente' : 'Novo Cliente'}
        description="Mantenha dados de contato e endereço completos para agilizar atendimentos."
      />

      <form onSubmit={handleSubmit}>
        {erro && <div className="alert alert-danger">{erro}</div>}

        <div className="form-section">
          <div className="form-section-header">
            <h2 className="form-section-title">Identificação</h2>
            <p className="form-section-description">Dados principais usados nas listas e ordens de serviço.</p>
          </div>
          <div className="form-section-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  className="form-control"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  maxLength="150"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">CPF/CNPJ</label>
                <input
                  type="text"
                  className="form-control"
                  name="cpfCnpj"
                  value={form.cpfCnpj}
                  onChange={handleChange}
                  maxLength="14"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <h2 className="form-section-title">Contato e endereço</h2>
            <p className="form-section-description">Informações para comunicação, retirada e entrega.</p>
          </div>
          <div className="form-section-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  list="dominios-email"
                  maxLength="150"
                  required
                />
                <datalist id="dominios-email">
                  <option value="@gmail.com" />
                  <option value="@outlook.com" />
                  <option value="@hotmail.com" />
                  <option value="@yahoo.com" />
                </datalist>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Telefone</label>
                <input
                  type="text"
                  className="form-control"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  maxLength="11"
                  required
                />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Endereço</label>
                <input
                  type="text"
                  className="form-control"
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  maxLength="255"
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Cidade</label>
                <input
                  type="text"
                  className="form-control"
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  maxLength="100"
                  required
                />
              </div>

              <div className="col-md-2 mb-3">
                <label className="form-label">UF</label>
                <input
                  type="text"
                  className="form-control"
                  name="uf"
                  maxLength="2"
                  value={form.uf}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">CEP</label>
                <input
                  type="text"
                  className="form-control"
                  name="cep"
                  value={form.cep}
                  onChange={handleChange}
                  maxLength="8"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/clientes')}
          >
            Cancelar
          </button>

          <button type="submit" className="btn btn-primary">
            Salvar Cliente
          </button>
        </div>
      </form>
    </Layout>
  )
}

export default ClienteForm
