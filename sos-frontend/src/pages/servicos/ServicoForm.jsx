import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import {
  buscarServicoPorId,
  criarServico,
  atualizarServico
} from '../../services/servicoService'
import { listarCategorias } from '../../services/categoriaService'

function ServicoForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const editando = !!id

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    precoBase: '',
    categoriaId: ''
  })

  const [categorias, setCategorias] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarDados() {
      try {
        const dadosCategorias = await listarCategorias()
        setCategorias(dadosCategorias)

        if (editando) {
          const servico = await buscarServicoPorId(id)

          if (!servico) {
            alert('Serviço não encontrado.')
            navigate('/servicos')
            return
          }

          setForm({
            nome: servico.nome || '',
            descricao: servico.descricao || '',
            precoBase: servico.precoBase || '',
            categoriaId: servico.categoriaId || ''
          })
        }
      } catch (error) {
        alert(error.message)
      }
    }

    carregarDados()
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

    if (!form.nome || !form.precoBase || !form.categoriaId) {
      setErro('Preencha nome, preço base e categoria.')
      return
    }

    if (Number(form.precoBase) <= 0) {
      setErro('O preço base deve ser maior que zero.')
      return
    }

    try {
      if (editando) {
        await atualizarServico(id, form)
        alert('Serviço atualizado com sucesso.')
      } else {
        await criarServico(form)
        alert('Serviço cadastrado com sucesso.')
      }

      navigate('/servicos')
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Serviços"
        title={editando ? 'Editar Serviço' : 'Novo Serviço'}
        description="Configure descrição, preço base e categoria para compor ordens de serviço."
      />

      <form onSubmit={handleSubmit}>
        {erro && <div className="alert alert-danger">{erro}</div>}

        <div className="form-section">
          <div className="form-section-header">
            <h2 className="form-section-title">Detalhes do serviço</h2>
            <p className="form-section-description">Esses dados alimentam o catálogo usado nos itens de OS e orçamento.</p>
          </div>
          <div className="form-section-body">
            <div className="mb-3">
              <label className="form-label">Nome</label>
              <input
                type="text"
                className="form-control"
                name="nome"
                value={form.nome}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-control"
                name="descricao"
                rows="4"
                value={form.descricao}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Preço Base</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="precoBase"
                  value={form.precoBase}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Categoria</label>
                <select
                  className="form-select"
                  name="categoriaId"
                  value={form.categoriaId}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/servicos')}
          >
            Cancelar
          </button>

          <button type="submit" className="btn btn-primary">
            Salvar Serviço
          </button>
        </div>
      </form>
    </Layout>
  )
}

export default ServicoForm
