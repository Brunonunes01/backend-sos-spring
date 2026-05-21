import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import {
  buscarClientePorId,
  criarCliente,
  atualizarCliente
} from '../../services/clienteService'

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
          cpfCnpj: cliente.cpfCnpj || '',
          email: cliente.email || '',
          telefone: cliente.telefone || '',
          endereco: cliente.endereco || '',
          cidade: cliente.cidade || '',
          uf: cliente.uf || '',
          cep: cliente.cep || ''
        })
      } catch (error) {
        alert(error.message)
      }
    }

    carregarCliente()
  }, [editando, id, navigate])

  function handleChange(e) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!form.nome || !form.cpfCnpj || !form.email) {
      setErro('Preencha nome, CPF/CNPJ e email.')
      return
    }

    try {
      if (editando) {
        await atualizarCliente(id, form)
        alert('Cliente atualizado com sucesso.')
      } else {
        await criarCliente(form)
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
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Telefone</label>
                <input
                  type="text"
                  className="form-control"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
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
