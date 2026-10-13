// کامپوننت سرچ که در header نمایش داده می‌شه

'use client'

import { useState } from 'react'
import { IconButton, InputBase, Paper } from '@mui/material'
import { IconSearch, IconX } from '@tabler/icons-react'

const Search = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const handleClear = () => {
    setQuery('')
    setOpen(false)
  }

  return (
    <Paper
      component='form'
      elevation={0}
      style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: '2px 8px',
        width: open ? 240 : 40,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <IconButton size='small' onClick={() => setOpen(true)}>
        <IconSearch size={18} />
      </IconButton>
      {open && (
        <>
          <InputBase
            autoFocus
            placeholder='جستجو...'
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, fontSize: 14 }}
          />
          <IconButton size='small' onClick={handleClear}>
            <IconX size={16} />
          </IconButton>
        </>
      )}
    </Paper>
  )
}

export default Search
