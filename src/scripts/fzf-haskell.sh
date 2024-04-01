findTag () {
  local command_string=$(cat <<'EOF'
  line={3}
  if ((line > 9)); then
    init=$((line-10))
  else
    init=0
  fi
  bat --theme="Horizon Anurag Ohri" -n --color=always --style=full \
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
    code -g $filepath
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
  bat --theme="Horizon Anurag Ohri" -n --color=always --style=full \
    -H {2} -r $init:$((line+10)) {1}
EOF
)
  if [ "$1" == "" ]; then
    query=""
  else
    query="-q $1"
  fi
  local filepath=$(\
    fd -t f -0 |\
    xargs --null awk '{print FILENAME"\0"FNR"\0"$0}' |\
    fzf --preview "$command_string" $query --delimiter "\0" --with-nth 3 |\
    awk -F '\0' '{print $1":"$2":0"}'
  )
  if [ "$filepath" != "" ]; then
    code -g $filepath
  fi
}

regenerateTags () {
  nix-shell -p haskellPackages.hasktags --run "hasktags -c ."
}

switchTab () {
  local command_string=$(cat <<'EOF'
  bat --theme="Horizon Anurag Ohri" -n --color=always --style=full -r :500 {}
EOF
)
  local filepath=$(
    fzf --preview "$command_string" --delimiter "/" --with-nth -1
  )
  if [ "$filepath" != "" ]; then
    code -g $filepath
  fi
}

openFolder () {
  ranger --choosedir=this
  contents=$(bat this)
  rm this
  if [ "$contents" != "" ]; then
    code $contents
  fi
}

openFile () {
  ranger --choosefile=this
  code -g $(bat this) && rm this
}