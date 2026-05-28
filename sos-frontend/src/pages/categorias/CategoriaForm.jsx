import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import {
  buscarCategoriaPorId,
  criarCategoria,
  atualizarCategoria
} from '../../services/categoriaService'

const REGEX_NOME = /^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .,'-]{3,100}$/
const REGEX_DESCRICAO = /^(?=.*[A-Za-zÀ-ÿ0-9])[A-Za-zÀ-ÿ0-9 .,'\-/º°]{3,500}$/

function CategoriaForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const editando = !!id

  const [form, setForm] = useState({
    nome: '',
    descricao: ''
  })

  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarCategoria() {
      if (!editando) return

      try {
        const categoria = await buscarCategoriaPorId(id)

        if (!categoria) {
          alert('Categoria não encontrada.')
          navigate('/categorias')
          return
        }

        setForm({
          nome: categoria.nome || '',
          descricao: categoria.descricao || ''
        })
      } catch (error) {
        alert(error.message)
      }
    }

    carregarCategoria()
  }, [editando, id, navigate])

  function handleChange(e) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  function validarFormulario() {
    const nome = form.nome.trim()
    const descricao = form.descricao.trim()

    if (!nome || !descricao) {
      return 'Preencha nome e descrição da categoria.'
    }

    if (!REGEX_NOME.test(nome)) {
      return 'Nome inválido. Não use apenas números ou caracteres especiais.'
    }

    if (!REGEX_DESCRICAO.test(descricao)) {
      return 'Descrição inválida. Evite caracteres especiais como #, $, @ e *.'
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
      descricao: form.descricao.trim()
    }

    try {
      if (editando) {
        await atualizarCategoria(id, payload)
        alert('Categoria atualizada com sucesso.')
      } else {
        await criarCategoria(payload)
        alert('Categoria cadastrada com sucesso.')
      }

      navigate('/categorias')
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Categorias"
        title={editando ? 'Editar Categoria' : 'Nova Categoria'}
        description="Defina grupos claros para organizar o catálogo de serviços."
      />

      <form onSubmit={handleSubmit}>
        {erro && <div className="alert alert-danger">{erro}</div>}

        <div className="form-section">
          <div className="form-section-header">
            <h2 className="form-section-title">Dados da categoria</h2>
            <p className="form-section-description">Use nomes curtos e descrições objetivas para facilitar a seleção.</p>
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
                maxLength="100"
                required
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
                maxLength="500"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/categorias')}
          >
            Cancelar
          </button>

          <button type="submit" className="btn btn-primary">
            Salvar Categoria
          </button>
        </div>
      </form>
    </Layout>
  )
}

export default CategoriaForm
