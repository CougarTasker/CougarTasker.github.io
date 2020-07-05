import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class TextSection extends Section{


  TextSection(AR it) {
    super(it);
  }

  @Override
  JComponent getContents() {
    JPanel out = new JPanel();
    out.setLayout(new GridBagLayout());
    GridBagConstraints c = new GridBagConstraints();
    c.gridx =0;
    c.gridy = 0;
    c.gridwidth =1;
    c.gridheight =1;
    c.fill=GridBagConstraints.HORIZONTAL;
    c.anchor = GridBagConstraints.NORTH;
    c.weightx = 0;

    add(new JLabel("Text"), c);

    c.gridy =1;
    c.fill = GridBagConstraints.BOTH;
    c.anchor = GridBagConstraints.CENTER;
    c.weightx =1;
    add(new JTextArea(),c);
    return out;
  }

  public TextSection() {

  }

  @Override
  public JButton getAddButton(AR it) {
    JButton out = new JButton("add text");
    out.addActionListener(new ActionListener() {
      @Override
      public void actionPerformed(ActionEvent e) {
        it.add(new TextSection(it));
      }
    });
    return out;
  }
}
