import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.List;

public abstract class Section extends JPanel {
  protected AR dispose = null;
  Section(){

  }

  Section(AR it){
    dispose= it;
    setLayout(new GridBagLayout());
    GridBagConstraints c = new GridBagConstraints();
    c.gridx =0;
    c.gridy = 0;
    c.gridwidth =1;
    c.gridheight =1;
    c.fill=GridBagConstraints.HORIZONTAL;
    c.anchor = GridBagConstraints.CENTER;
    c.weightx = 1;

    add(getContents(), c);

    JButton del = new JButton("remove");
    Section self = this;
    del.addActionListener(new ActionListener() {
      @Override
      public void actionPerformed(ActionEvent e) {
        it.remove(self);
      }
    });
    c.gridx =1;
    c.fill = GridBagConstraints.NONE;
    c.anchor = GridBagConstraints.LINE_END;
    c.weightx =0;
    add(del,c);

  }
  abstract JComponent getContents();
  abstract public JButton getAddButton(AR it);
}
