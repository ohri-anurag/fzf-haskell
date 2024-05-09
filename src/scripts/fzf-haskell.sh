findTag () {
  local command_string=$(cat <<'EOF'
  line={3}
  if ((line > 9)); then
    init=$((line-10))
  else
    init=0
  fi
  bat --color=always --style=full \
    -H {3} -r $init:$((line+10)) {2}
EOF
)
  if [ "$1" == "" ]; then
    query=""
  else
    query="-q $1"
  fi
  local filepath=$(\
    cat tags |\
    fzf --preview "$command_string" $query --delimiter "\t" --with-nth 1 |\
    awk '{print "/home/anuragohri92/bellroy/haskell/"$(NF-1)":"$NF":0"}'
  )
  if [ "$filepath" != "" ]; then
    code -g -r $filepath
  fi
}

findAll () {
  local command_string=$(cat <<'EOF'
  line={2}
  if ((line > 9)); then
    init=$((line-10))
  else
    init=0
  fi
  bat --color=always --style=full \
    -H {2} -r $init:$((line+10)) {1}
EOF
)
  if [ "$1" == "" ]; then
    query=""
  else
    query="-q $1"
  fi
  local filepath=$(\
    rg --column --line-number --no-heading --hidden --field-match-separator='\0' . |\
    fzf --preview "$command_string" $query --delimiter "\0" --with-nth 4 |\
    awk -F '\0' '{print $1":"$2":0"}'
  )
  if [ "$filepath" != "" ]; then
    code -g -r $filepath
  fi
}

findFile () {
  local command_string=$(cat <<'EOF'
  bat --color=always --style=full {}
EOF
)
  local filepath=$(\
    fd -t f -H |\
    fzf --preview "$command_string" |\
    awk -F '\0' '{print $1":"$2":0"}'
  )
  if [ "$filepath" != "" ]; then
    code -g -r $filepath
  fi
}

regenerateTags () {
  hasktags -c .
}

switchTab () {
  local command_string=$(cat <<'EOF'
  bat --color=always --style=full -r :500 {}
EOF
)
  local filepath=$(
    fzf --preview "$command_string" --delimiter "/" --with-nth -1
  )
  if [ "$filepath" != "" ]; then
    code -g -r $filepath
  fi
}

openFolder () {
  yazi --cwd-file "$PWD/this"
  contents=$(bat this)
  rm this
  if [ "$contents" != "" ]; then
    code $contents
  fi
}

openFile () {
  yazi --chooser-file "$PWD/this" $1
  if [[ -f this ]]; then
    code -g -r $(bat this) && rm this
  fi
}

hoogleSearch () {
  local search_results=$(hoogle search --json $1)
  if [[ "$search_results" = "No results found" ]]; then
    echo "No results found"
  else
    local url=$(
      echo $search_results |\
      jq -r '.[] | "\(.package.name)\u0000\(.module.name)\u0000\(.item)\u0000\(.url)"' |\
      fzf --delimiter '\0' --with-nth 2 --preview "printf {1}\"\n\"{2}\"\n\"{3} > tmp.hs | bat --color=always --style=full tmp.hs" |\
      cut -d $'\0' -f4 && rm tmp.hs
    )
    if [[ "$url" != "" ]]; then
      google-chrome $url
    fi
  fi
}