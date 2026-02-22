/**
 * Completion command - Generate shell completion scripts
 */

import { defineCommand } from 'citty'

type Shell = 'bash' | 'zsh' | 'fish'

const SUBCOMMANDS = [
  'search',
  'search-advanced',
  'code',
  'crawl',
  'company',
  'people',
  'config',
  'research',
  'completion',
]

const SUBCOMMANDS_LIST = SUBCOMMANDS.join(' ')

function generateBashCompletion(): string {
  return `# exa bash completion
_exa_completion() {
  local cur prev
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  # Subcommands
  if [[ $COMP_CWORD -eq 1 ]]; then
    COMPREPLY=($(compgen -W "${SUBCOMMANDS_LIST}" -- "$cur"))
    return 0
  fi

  # Command-specific options
  case "\${COMP_WORDS[1]}" in
    search)
      case "$prev" in
        --num|--limit|-n)
          return 0
          ;;
        --output|-o)
          COMPREPLY=($(compgen -W "text json markdown" -- "$cur"))
          return 0
          ;;
        --query|-q)
          return 0
          ;;
      esac
      ;;
    search-advanced)
      case "$prev" in
        --num|--limit|-n)
          return 0
          ;;
        --output|-o)
          COMPREPLY=($(compgen -W "text json markdown" -- "$cur"))
          return 0
          ;;
      esac
      ;;
    code)
      case "$prev" in
        --num|--limit|-n)
          return 0
          ;;
        --output|-o)
          COMPREPLY=($(compgen -W "text json markdown" -- "$cur"))
          return 0
          ;;
        --language|-l)
          COMPREPLY=($(compgen -W "javascript typescript python java go rust ruby php c cpp csharp" -- "$cur"))
          return 0
          ;;
      esac
      ;;
    crawl)
      case "$prev" in
        --num|--limit|-n)
          return 0
          ;;
        --output|-o)
          COMPREPLY=($(compgen -W "text json markdown" -- "$cur"))
          return 0
          ;;
        --max-depth|-d)
          return 0
          ;;
      esac
      ;;
    company)
      case "$prev" in
        --num|--limit|-n)
          return 0
          ;;
        --output|-o)
          COMPREPLY=($(compgen -W "text json markdown" -- "$cur"))
          return 0
          ;;
      esac
      ;;
    people)
      case "$prev" in
        --num|--limit|-n)
          return 0
          ;;
        --output|-o)
          COMPREPLY=($(compgen -W "text json markdown" -- "$cur"))
          return 0
          ;;
      esac
      ;;
    config)
      case "$prev" in
        set)
          COMPREPLY=($(compgen -W "apiKey output defaultNum" -- "$cur"))
          return 0
          ;;
        get)
          COMPREPLY=($(compgen -W "apiKey output defaultNum" -- "$cur"))
          return 0
          ;;
      esac
      ;;
    research)
      case "$prev" in
        --num|--limit|-n)
          return 0
          ;;
        --output|-o)
          COMPREPLY=($(compgen -W "text json markdown" -- "$cur"))
          return 0
          ;;
      esac
      ;;
  esac

  # Global options
  COMPREPLY=($(compgen -W "--help --version" -- "$cur"))
  return 0
}

complete -F _exa_completion exa
`
}

function generateZshCompletion(): string {
  return `# exa zsh completion
#autoload -U compinit
#compinit

local -a _subcommands
_subcommands=(
  'search:Search the web'
  'search-advanced:Advanced search with filters'
  'code:Search for code'
  'crawl:Crawl URLs'
  'company:Search for companies'
  'people:Search for people'
  'config:Manage CLI configuration'
  'research:Research topics deeply'
  'completion:Generate shell completion scripts'
)

local -a _global_opts
_global_opts=(
  '--help[Show help]'
  '--version[Show version]'
)

local -a _search_opts
_search_opts=(
  '--num[Number of results]:number:'
  '--limit[Number of results]:number:'
  '-n[Number of results]:number:'
  '--output[Output format]:format:(text json markdown)'
  '-o[Output format]:format:(text json markdown)'
  '--query[Search query]:query:'
  '-q[Search query]:query:'
)

local -a _code_opts
_code_opts=(
  '--num[Number of results]:number:'
  '--limit[Number of results]:number:'
  '-n[Number of results]:number:'
  '--output[Output format]:format:(text json markdown)'
  '-o[Output format]:format:(text json markdown)'
  '--language[Programming language]:language:(javascript typescript python java go rust ruby php c cpp csharp)'
  '-l[Programming language]:language:(javascript typescript python java go rust ruby php c cpp csharp)'
  '--query[Code search query]:query:'
  '-q[Code search query]:query:'
)

local -a _crawl_opts
_crawl_opts=(
  '--num[Number of results]:number:'
  '--limit[Number of results]:number:'
  '-n[Number of results]:number:'
  '--output[Output format]:format:(text json markdown)'
  '-o[Output format]:format:(text json markdown)'
  '--max-depth[Crawl depth]:depth:'
  '-d[Crawl depth]:depth:'
  '--url[URL to crawl]:url:'
)

local -a _company_opts
_company_opts=(
  '--num[Number of results]:number:'
  '--limit[Number of results]:number:'
  '-n[Number of results]:number:'
  '--output[Output format]:format:(text json markdown)'
  '-o[Output format]:format:(text json markdown)'
  '--name[Company name]:name:'
)

local -a _people_opts
_people_opts=(
  '--num[Number of results]:number:'
  '--limit[Number of results]:number:'
  '-n[Number of results]:number:'
  '--output[Output format]:format:(text json markdown)'
  '-o[Output format]:format:(text json markdown)'
  '--name[Person name]:name:'
  '--title[Job title]:title:'
  '--company[Company name]:company:'
)

local -a _config_opts
_config_opts=(
  'set[Set a config value]'
  'get[Get a config value]'
  'list[List all config values]'
  'clear[Clear config]'
)

local -a _config_keys
_config_keys=(
  'apiKey[API key]'
  'output[Output format]'
  'defaultNum[Default number of results]'
)

_exa() {
  local -a cmd
  opts_help=('{-h,--help}'[Show help] '{-v,--version}'[Show version])
  
  _arguments -C \\
    '1: :_subcommands' \\
    '*:: :->args' \\
    && ret=0
  
  case "\$words[1]" in
    search)
      _arguments "\${_search_opts[@]}" && ret=0
      ;;
    search-advanced)
      _arguments "\${_search_opts[@]}" && ret=0
      ;;
    code)
      _arguments "\${_code_opts[@]}" && ret=0
      ;;
    crawl)
      _arguments "\${_crawl_opts[@]}" && ret=0
      ;;
    company)
      _arguments "\${_company_opts[@]}" && ret=0
      ;;
    people)
      _arguments "\${_people_opts[@]}" && ret=0
      ;;
    config)
      _arguments "\${_config_opts[@]}" && ret=0
      ;;
    research)
      _arguments "\${_search_opts[@]}" && ret=0
      ;;
    completion)
      _arguments '1:shell:(bash zsh fish)' && ret=0
      ;;
  esac
  
  return ret
}

_exa "$@"
`
}

function generateFishCompletion(): string {
  return `# exa fish completion

# Main completion function
complete -c exa -f -a 'search' -d 'Search the web'
complete -c exa -f -a 'search-advanced' -d 'Advanced search with filters'
complete -c exa -f -a 'code' -d 'Search for code'
complete -c exa -f -a 'crawl' -d 'Crawl URLs'
complete -c exa -f -a 'company' -d 'Search for companies'
complete -c exa -f -a 'people' -d 'Search for people'
complete -c exa -f -a 'config' -d 'Manage CLI configuration'
complete -c exa -f -a 'research' -d 'Research topics deeply'
complete -c exa -f -a 'completion' -d 'Generate shell completion scripts'

# Global options
complete -c exa -f -l help -d 'Show help'
complete -c exa -f -l version -d 'Show version'

# search command
complete -c exa -n '__fish_use_subcommand' -f -a 'search'
complete -c exa -n '__fish_seen_subcommand_from search' -l num -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from search' -l limit -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from search' -s n -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from search' -l output -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from search' -s o -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from search' -l query -d 'Search query' -r
complete -c exa -n '__fish_seen_subcommand_from search' -s q -d 'Search query' -r

# search-advanced command
complete -c exa -n '__fish_use_subcommand' -f -a 'search-advanced'
complete -c exa -n '__fish_seen_subcommand_from search-advanced' -l num -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from search-advanced' -l limit -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from search-advanced' -s n -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from search-advanced' -l output -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from search-advanced' -s o -d 'Output format' -a 'text json markdown' -f

# code command
complete -c exa -n '__fish_use_subcommand' -f -a 'code'
complete -c exa -n '__fish_seen_subcommand_from code' -l num -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from code' -l limit -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from code' -s n -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from code' -l output -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from code' -s o -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from code' -l language -d 'Programming language' -a 'javascript typescript python java go rust ruby php c cpp csharp' -f
complete -c exa -n '__fish_seen_subcommand_from code' -s l -d 'Programming language' -a 'javascript typescript python java go rust ruby php c cpp csharp' -f
complete -c exa -n '__fish_seen_subcommand_from code' -l query -d 'Code search query' -r
complete -c exa -n '__fish_seen_subcommand_from code' -s q -d 'Code search query' -r

# crawl command
complete -c exa -n '__fish_use_subcommand' -f -a 'crawl'
complete -c exa -n '__fish_seen_subcommand_from crawl' -l num -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from crawl' -l limit -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from crawl' -s n -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from crawl' -l output -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from crawl' -s o -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from crawl' -l max-depth -d 'Crawl depth' -r
complete -c exa -n '__fish_seen_subcommand_from crawl' -s d -d 'Crawl depth' -r
complete -c exa -n '__fish_seen_subcommand_from crawl' -l url -d 'URL to crawl' -r

# company command
complete -c exa -n '__fish_use_subcommand' -f -a 'company'
complete -c exa -n '__fish_seen_subcommand_from company' -l num -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from company' -l limit -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from company' -s n -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from company' -l output -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from company' -s o -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from company' -l name -d 'Company name' -r

# people command
complete -c exa -n '__fish_use_subcommand' -f -a 'people'
complete -c exa -n '__fish_seen_subcommand_from people' -l num -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from people' -l limit -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from people' -s n -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from people' -l output -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from people' -s o -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from people' -l name -d 'Person name' -r
complete -c exa -n '__fish_seen_subcommand_from people' -l title -d 'Job title' -r
complete -c exa -n '__fish_seen_subcommand_from people' -l company -d 'Company name' -r

# config command
complete -c exa -n '__fish_use_subcommand' -f -a 'config'
complete -c exa -n '__fish_seen_subcommand_from config' -f -a 'set' -d 'Set a config value'
complete -c exa -n '__fish_seen_subcommand_from config' -f -a 'get' -d 'Get a config value'
complete -c exa -n '__fish_seen_subcommand_from config' -f -a 'list' -d 'List all config values'
complete -c exa -n '__fish_seen_subcommand_from config' -f -a 'clear' -d 'Clear config'

# research command
complete -c exa -n '__fish_use_subcommand' -f -a 'research'
complete -c exa -n '__fish_seen_subcommand_from research' -l num -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from research' -l limit -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from research' -s n -d 'Number of results' -r
complete -c exa -n '__fish_seen_subcommand_from research' -l output -d 'Output format' -a 'text json markdown' -f
complete -c exa -n '__fish_seen_subcommand_from research' -s o -d 'Output format' -a 'text json markdown' -f

# completion command
complete -c exa -n '__fish_use_subcommand' -f -a 'completion'
complete -c exa -n '__fish_seen_subcommand_from completion' -f -a 'bash' -d 'Bash completion'
complete -c exa -n '__fish_seen_subcommand_from completion' -f -a 'zsh' -d 'Zsh completion'
complete -c exa -n '__fish_seen_subcommand_from completion' -f -a 'fish' -d 'Fish completion'
`
}

export default defineCommand({
  meta: {
    name: 'completion',
    description: 'Generate shell completion scripts',
  },
  args: {
    shell: {
      type: 'positional',
      required: true,
      description: 'Shell type (bash, zsh, fish)',
      value: (val: string) => {
        const validShells: Shell[] = ['bash', 'zsh', 'fish']
        if (!validShells.includes(val as Shell)) {
          throw new Error(`Invalid shell: ${val}. Valid shells: ${validShells.join(', ')}`)
        }
        return val
      },
    },
  },
  run({ args }) {
    const shell = args.shell as Shell
    
    let completionScript: string
    
    switch (shell) {
      case 'bash':
        completionScript = generateBashCompletion()
        break
      case 'zsh':
        completionScript = generateZshCompletion()
        break
      case 'fish':
        completionScript = generateFishCompletion()
        break
      default:
        throw new Error(`Unsupported shell: ${shell}`)
    }
    
    console.log(completionScript)
  },
})
