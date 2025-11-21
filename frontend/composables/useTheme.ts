export const useTheme = () => {
  const theme = ref('dark')
  const isDark = computed(() => theme.value === 'dark')

  const initTheme = () => {
    if (process.client) {
      // Check localStorage first
      const savedTheme = localStorage.getItem('vantis-theme')
      
      if (savedTheme === 'light' || savedTheme === 'dark') {
        theme.value = savedTheme
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        theme.value = prefersDark ? 'dark' : 'light'
      }
      
      applyTheme()
    }
  }

  const applyTheme = () => {
    if (process.client) {
      const root = document.documentElement
      if (theme.value === 'dark') {
        root.classList.remove('light-mode')
        root.classList.add('dark-mode')
      } else {
        root.classList.remove('dark-mode')
        root.classList.add('light-mode')
      }
    }
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    if (process.client) {
      localStorage.setItem('vantis-theme', theme.value)
      applyTheme()
    }
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    if (process.client) {
      localStorage.setItem('vantis-theme', newTheme)
      applyTheme()
    }
  }

  onMounted(() => {
    initTheme()
    // Listen for system theme changes
    if (process.client) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e) => {
        if (!localStorage.getItem('vantis-theme')) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      }
      mediaQuery.addEventListener('change', handleChange)
      
      onUnmounted(() => {
        mediaQuery.removeEventListener('change', handleChange)
      })
    }
  })

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    initTheme
  }
}

