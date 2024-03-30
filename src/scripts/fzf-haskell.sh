findTag () {
  local command_string=$(cat <<'EOF'
  bat --theme="Horizon Anurag Ohri" -n --color=always \
    -H $(echo {} | awk '{print $NF}') \
    -r $(\
      echo {} |\
      awk '{\
        if ($NF>9) {\
          init = $NF-10\
        }\
        else {\
          init = 0\
        }\
        printf "%d:%d", init, ($NF+10)\
        }'\
    ) \
    $(\
      echo {} |\
      awk '{print $(NF-1)}'\
    )
EOF
)
  local filepath=$(\
    cat tags |\
    fzf --preview "$command_string" -q $1 |\
    awk '{print "/home/anuragohri92/bellroy/haskell/"$(NF-1)":"$NF":0"}'
  )
  if [ "$filepath" != "" ]; then
    code -g $filepath
  fi
}

findAll () {
  local command_string=$(cat <<'EOF'
  bat --theme="Horizon Anurag Ohri" -n --color=always \
    -H $(echo {} | awk '{print $NF}' | awk -F ':' '{print $NF}') \
    -r $(\
      echo {} |\
      awk '{print $NF}' |\
      awk -F ':' '{\
        if ($NF>9) {\
          init = $NF-10\
        }\
        else {\
          init = 0\
        }\
        printf "%d:%d", init, ($NF+10)\
        }'\
    ) \
    $(\
      echo {} |\
      awk '{print $NF}' |\
      awk -F ':' '{print $(NF-1)}'\
    )
EOF
)
  local filepath=$(\
    fd -t f -0 |\
    xargs --null awk '{print $0" "FILENAME":"FNR}' |\
    fzf --preview "$command_string" -q $1 |\
    awk '{print $NF}'
  )
  if [ "$filepath" != "" ]; then
    code -g $filepath
  fi
}

regenerateTags () {
  cd $rootDir
  nix-shell -p haskellPackages.hasktags --run "hasktags -c ."
}