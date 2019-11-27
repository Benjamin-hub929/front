import React, { Component, Fragment } from 'react'
import { UPDATE_PAGE } from '../queries/pages'
import { graphql, withApollo } from 'react-apollo'
// import { useMutation } from '@apollo/react-hooks' À VOIR AVEC LES HOOKS

import DroppableItem from '../components/DroppableItem'

if (typeof window !== 'undefined') {
  var placeholder = document.createElement('li')
  placeholder.className = 'Webtree-item Webtree-item--placeholder'
}

class WebTreeDroppableList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      draggableItems: [],
      isDraggable: true,
      isEditable: false,
    }
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragOver = this.onDragOver.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.setDraggableState = this.setDraggableState.bind(this)
  }
  componentDidMount() {
    this.setState({ draggableItems: this.props.data.allPages })
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.data !== prevProps.data)
      this.setState({ draggableItems: this.props.data.allPages })
  }
  onDragStart(id, name, e) {
    this.dragged = e.currentTarget
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', this.dragged)
  }
  onDragEnd(e) {
    let { draggableItems } = this.state
    this.dragged.style.display = 'block'
    document.querySelector('.Webtree-item--placeholder').remove()
    var from = Number(this.dragged.dataset.id)
    var to
    this.dragged.dataset.id < this.over.dataset.id
      ? (to = Number(this.over.dataset.id + 1))
      : (to = Number(this.over.dataset.id))
    if (from < to) to--
    console.log(this.over.dataset.id)

    draggableItems.splice(to, 0, draggableItems.splice(from, 1)[0])
    this.setState(
      {
        draggableItems: draggableItems,
      },
      () => {
        this.updateSortIndexes()
      }
    )
  }
  onDragOver(e) {
    e.preventDefault()
    if (e.target.className === 'Webtree-item--placeholder') return
    this.over = e.target
    this.dragged.dataset.id < this.over.dataset.id
      ? e.target.parentNode.insertBefore(placeholder, e.target.nextSibling)
      : e.target.parentNode.insertBefore(placeholder, e.target)
  }

  updateSortIndexes() {
    const { draggableItems } = this.state
    draggableItems.forEach((item, i) => {
      this.props
        .mutate({
          variables: {
            input: { id: item.id, name: item.name, sort: i },
          },
          // refetchQueries: [{ query: GET_ALL_PAGES }],
        })
        .then(res => {
          console.log({
            success: 'The item was updated!',
          })
        })
        .catch(error => {})
    })
  }
  setDraggableState() {
    this.state.isDraggable
      ? this.setState({ isDraggable: false, isEditable: true })
      : this.setState({ isDraggable: true, isEditable: false })
  }

  render() {
    const { draggableItems, isDraggable } = this.state
    return (
      <Fragment>
        {isDraggable ? (
          <h3>You're in draggable mode</h3>
        ) : (
          <h3>You're in editable mode</h3>
        )}
        <button onClick={this.updateSortIndexes.bind(this)}>UpdateList</button>
        <ul>
          {draggableItems.map((page, i) => (
            <DroppableItem
              {...this.state}
              className="Webtree-item"
              key={page.id}
              id={page.id}
              content={page.name}
              dataId={i}
              sort={page.sort}
              onDragEnd={this.onDragEnd}
              onDragStart={e => this.onDragStart(page.id, page.name, e)}
              onDragOver={this.onDragOver}
              setDraggableState={this.setDraggableState}
            />
          ))}
        </ul>
      </Fragment>
    )
  }
}

export default withApollo(graphql(UPDATE_PAGE)(WebTreeDroppableList))
