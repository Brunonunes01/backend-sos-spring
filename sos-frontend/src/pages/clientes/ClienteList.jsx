import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import {
  listarClientes,
  excluirCliente
} from '../../services/clienteService'

function ClienteList() {
  const [clientes, setClientes] = useState([])
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  async function carregarClientes() {
    const dados = await listarClientes()
    setClientes(dados)
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  async function handleExcluir(id) {
    const confirmar = confirm('Deseja desativar este cliente?')

    if (!confirmar) return

    try {
      await excluirCliente(id)
      alert('Cliente desativado com sucesso.')
      carregarClientes()
    } catch (error) {
      alert(error.message)
    }
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = busca.toLowerCase()
    return [
      cliente.nome,
      cliente.cpfCnpj,
      cliente.email,
      cliente.telefone,
      cliente.cidade,
      cliente.uf
    ].some((campo) => String(campo || '').toLowerCase().includes(termo))
  })

  return (
    <Layout>
      <PageHeader
        eyebrow="Cadastros"
        title="Clientes"
        description="Gerencie a base de clientes usada em orçamentos e ordens de serviço."
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/clientes/novo')}>
            + Novo Cliente
          </button>
        }
      />

      <div className="summary-strip">
        <div className="summary-item">
          <p className="summary-label">Total</p>
          <p className="summary-value">{clientes.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Com e-mail</p>
          <p className="summary-value">{clientes.filter((cliente) => cliente.email).length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Com telefone</p>
          <p className="summary-value">{clientes.filter((cliente) => cliente.telefone).length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Resultado</p>
          <p className="summary-value">{clientesFiltrados.length}</p>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-field">
          <label className="form-label">Buscar cliente</label>
          <input
            className="form-control"
            placeholder="Nome, documento, e-mail, telefone ou cidade"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        {clientesFiltrados.length > 0 ? (
          <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>CPF/CNPJ</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Cidade</th>
                <th>UF</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="muted-cell">#{cliente.id}</td>
                  <td className="table-primary-text">{cliente.nome}</td>
                  <td>{cliente.cpfCnpj}</td>
                  <td>{cliente.email || '-'}</td>
                  <td>{cliente.telefone || '-'}</td>
                  <td>{cliente.cidade || '-'}</td>
                  <td>{cliente.uf || '-'}</td>
                  <td>
                    <span className="action-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleExcluir(cliente.id)}
                    >
                      Excluir
                    </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <EmptyState
            title="Nenhum cliente encontrado"
            description="Ajuste a busca ou cadastre um novo cliente para iniciar uma ordem."
            action={
              <button className="btn btn-primary" onClick={() => navigate('/clientes/novo')}>
                + Novo Cliente
              </button>
            }
          />
        )}
      </div>
    </Layout>
  )
}

export default ClienteList
